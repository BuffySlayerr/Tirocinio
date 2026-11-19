import csv
import sys
import scipy.integrate as sc
import scipy.optimize as scopt
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.cbook as cbook
import math
from io import StringIO
# from model_conductor import makeModel as mcmm
# from model_conductor import model_Fmodel as mcfm
# from model_conductor import obs_properties as mcobs
# from model_conductor import resetGlobal as mcrg
# from model_conductor import dif_properties
# from model_conductor import x_index_for_properties
# from model_conductor import y_index_for_properties

# from model_conductor import *
#from model_conductor import alg_properties
from model_conductor import ModelConductor


class Learning:
    mc = None
    data = []
    header = []
    training_data = []
    test_data = []
    training_data_observation = []
    training_data_actions = []
    test_data_observation = []
    test_data_actions = []
    isDrone = True

    def getCurrentActions(self, timestamp, data_actions):
        times = list(map(lambda x: x[0], data_actions))
        j = list(filter(lambda x: x[1] <= timestamp, enumerate(times)))[-1]
        index = j[0]
        el = data_actions[index]
        return [el[1], el[2]] # FIXME: indices for actions not hard coded

    def readProperty(self, propName, timestamp, tmp_data):
        timestamp_index = self.header.index('timestamp')
        header_index = self.header.index(propName) 
        times = list(map(lambda x: x[timestamp_index], tmp_data))
        j = list(filter(lambda x: float(x[1]) <= timestamp, enumerate(times)))[-1]
        index = j[0]
        el = tmp_data[index]
        # print(el[header_index])
        # print(el)
        return el[header_index]

    def Fmodel(self, t, x, params, data):
        tmp_data = data
        y = self.algFmodel(t, x, params, data)
        timestamp = t
        [y_arr, x_arr] = self.mc.model_Fmodel()
        dxdt = [0] * len(x_arr)
        for eq in x_arr:
            # print(eq)
            exec(eq)
        #eval(x_arr)
        return dxdt

    def algFmodel(self, t, x, params, data):
        tmp_data = data
        timestamp = t
        y_arr = self.mc.model_Fmodel()[0]
        y = [0] * len(y_arr)
        for eq in y_arr:
            # print(eq)
            exec(eq)
        return y

    def integrateEstimationModel(self, data, Fmodel, t_eval, x0, params):
        t_span = [t_eval[0], t_eval[-1]]
        odesol = sc.solve_ivp(self.odefun, t_span, x0, t_eval=t_eval, args=[data,params])
        return odesol

    def odefun(self, t,x,data,params):
        dxdt = self.Fmodel(t, x, params, data)
        return dxdt

    def extractParams(self, vars):
        x0 = vars[0:len(self.mc.dif_properties)]
        params = vars[len(self.mc.dif_properties):]
        return [params, x0]

    def lsfun(self, vars, tmp_data_observation, tmp_data):
        [params, x0] = self.extractParams(vars)
        XYobs_index = []
        tobs_index = self.header.index('timestamp')
        for key in self.mc.obs_properties:
            XYobs_index.append(self.header.index(key))
        tobs = np.array(tmp_data_observation, dtype=object)[:, tobs_index]
        # observations
        XYobs = np.array(tmp_data_observation, dtype=object)[:, XYobs_index]
        # differential properties
        odesol = self.integrateEstimationModel(tmp_data, self.Fmodel, tobs, x0, params)
        Xest = odesol.y
        # algebraic properties
        Yest = []
        for e in enumerate(tobs):
            Yest.append(self.algFmodel(e[1], Xest[:,e[0]], params, tmp_data))
        Yest = np.transpose(Yest)
        # observable estimates
        XYest = []
        for key in self.mc.obs_properties:
            if key in self.mc.x_index_for_properties:
                XYest.append(Xest[self.mc.x_index_for_properties[key]])
            if key in self.mc.y_index_for_properties:
                XYest.append(Yest[self.mc.y_index_for_properties[key]])
        XYest = np.transpose(XYest)
        # compare and vectorize
        f = XYest - XYobs
        f = np.ndarray.flatten(f)
        f = f.tolist()
        return f

    def resetGlobal(self):
        self.data = []
        self.header = []
        self.training_data = []
        self.test_data = []
        self.training_data_observation = []
        self.training_data_actions = []
        self.test_data_observation = []
        self.test_data_actions = []
        # mcrg()
        self.mc = ModelConductor(self.isDrone)

    def main(self, arg = None):
        # mcrg()
        #print(arg)
        csv_reader = None
        training_perc = 0.70
        row_count = 0
        if arg == None or len(arg) == 0:
            if self.isDrone:
                csv_file = open('output_drone.csv_fixed')
            else:
                csv_file = open('output_double.csv')
            csv_reader = csv.reader(csv_file, delimiter=',', quoting=csv.QUOTE_NONNUMERIC)
            row_count = len(list(csv_reader))
            # csv_file = open('output_double.csv')
            csv_file = open('output_drone.csv_fixed')
            csv_reader = csv.reader(csv_file, delimiter=',', quoting=csv.QUOTE_NONNUMERIC)
        else:
            csv_reader = StringIO(arg[0])
            csv_reader = csv.reader(csv_reader, delimiter=',', quoting=csv.QUOTE_NONNUMERIC)
            row_count = len(list(csv_reader))
            csv_reader = StringIO(arg[0])
            csv_reader = csv.reader(csv_reader, delimiter=',', quoting=csv.QUOTE_NONNUMERIC)
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                self.header = row.copy()
                line_count += 1
            else:
                row[:] = [1 if x == 'true' else x for x in row]
                row[:] = [0 if x == 'false' else x for x in row]
                operation = row[0]
                if line_count < row_count * training_perc:
                    self.training_data.append(row)
                else:
                    self.test_data.append(row)
                if operation == 'observation':
                    if line_count < row_count * training_perc:
                        self.training_data_observation.append(row)
                    else:
                        self.test_data_observation.append(row)
                else:
                    if line_count < row_count * training_perc:
                        self.training_data_actions.append(row)
                    else:
                        self.test_data_actions.append(row)

                line_count += 1
        self.mc = ModelConductor(self.isDrone)
        # global dif_properties
        # global x_index_for_properties
        # global y_index_for_properties
        # [dif_properties, x_index_for_properties, y_index_for_properties, lowerBounds, upperBounds, params_counter] =  mcmm()
        self.mc.makeModel()
        #print(self.mc.params_counter)
        x0 = [15.0, 16.0, 0.0] # FIXME: use initial measurements/states
        x0 = [0] * len(self.mc.dif_properties) # take the first line in csv
        state_counter = len(x0) # FIXME
        params = self.mc.iguess
        print('guess params')
        print(params)

        tobs_index = self.header.index('timestamp')
        t_eval = np.array(self.training_data_observation, dtype=object)[:, tobs_index] # timestamp
        
        print('run integration model')
        odesol_guess = self.integrateEstimationModel(self.training_data_actions, self.Fmodel, t_eval, x0, params)
        #print(odesol_guess.t)
        #print(odesol_guess.y)
        #sys.exit(0)

        t_future = np.array(self.test_data_observation, dtype=object)[:,tobs_index]
        t_grid = np.arange(t_eval[0], t_future[-1], 60)
        # print(t_grid)


        tobs_index = self.header.index('timestamp')
        tobs = np.array(self.training_data)[:, tobs_index]

        vars0 = [*x0, *params]
        
        print('run least squares residual')
        lsresidual0 = self.lsfun(vars0, self.training_data_observation, self.training_data_actions)
        #print(lsresidual0)

        lowerBounds = [*([-np.inf] * state_counter), *self.mc.lowerBounds]
        upperBounds = [*([np.inf] * state_counter), *self.mc.upperBounds]
        # FIXME: training data?
        #print('lower bounds')
        #print(lowerBounds)
        #print('upper bounds')
        #print(upperBounds)
        print('run least squares')
        lssol = scopt.least_squares( self.lsfun, vars0, args=[self.training_data_observation, self.training_data_actions],
                method='dogbox', verbose=2,
                xtol=1e-15, ftol=1e-12, gtol=1e-12,
                bounds = [lowerBounds, upperBounds],
                max_nfev=3 )
        print('least squares solved')
        #sys.exit(0)

        vars = lssol.x
        [params_opt, x0_opt] = self.extractParams(vars)
        print('optimal params')
        print(params_opt)
        print('optimal initial state')
        print(x0_opt)
        odesol_opt = self.integrateEstimationModel(self.training_data_actions, self.Fmodel, t_eval, x0_opt, params_opt)

        t_eval_future = [t_eval[0], *t_future]
        odesol_future = self.integrateEstimationModel([*self.training_data_actions, *self.test_data_actions], self.Fmodel, t_eval_future, x0_opt, params_opt)
        
        if self.isDrone == False:
            heater = []
            cooler = []
            for t in t_grid:
                # val = getCurrentActions(t, [*training_data_actions, *test_data_actions])
                val = self.readProperty('heater', t, [*self.training_data_actions, *self.test_data_actions])
                val1 = self.readProperty('cooler', t, [*self.training_data_actions, *self.test_data_actions])
                h = 1 if val else 0;
                heater.append(h)
                cooler.append(val1)

            
            observation_index = self.header.index('temperature')
            observation1_index = self.header.index('temperature1')
            timestamp_index = self.header.index('timestamp')
            payload = {}
            payload['data_temperature'] = { 'x': np.array(self.training_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.training_data_observation, dtype=object)[:, observation_index].tolist() }
            payload['data_temperature1'] = { 'x': np.array(self.training_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.training_data_observation, dtype=object)[:, observation1_index].tolist() }
            payload['odesol_guess'] = { 't': odesol_guess.t.tolist(), 'y': odesol_guess.y[self.mc.x_index_for_properties['temperature']].tolist() }
            payload['odesol_guess1'] = { 't': odesol_guess.t.tolist(), 'y': odesol_guess.y[self.mc.x_index_for_properties['temperature1']].tolist() }
            payload['odesol_opt'] = { 't': odesol_opt.t.tolist(), 'y': odesol_opt.y[self.mc.x_index_for_properties['temperature']].tolist() }
            payload['odesol_opt1'] = { 't': odesol_opt.t.tolist(), 'y': odesol_opt.y[self.mc.x_index_for_properties['temperature1']].tolist() }
            payload['t_grid'] = t_grid.tolist() 
            payload['heater'] = heater 
            payload['cooler'] = cooler 
            payload['odesol_future'] = { 't': odesol_future.t.tolist(), 'y': odesol_future.y[self.mc.x_index_for_properties['temperature']].tolist() } 
            payload['odesol_future1'] = { 't': odesol_future.t.tolist(), 'y': odesol_future.y[self.mc.x_index_for_properties['temperature1']].tolist() } 
            payload['future_data_temperature'] = { 'x': np.array(self.test_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.test_data_observation, dtype=object)[:, observation_index].tolist() }
            payload['future_data_temperature1'] = { 'x': np.array(self.test_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.test_data_observation, dtype=object)[:, observation1_index].tolist() }
            self.resetGlobal() 
            return payload

        elif self.isDrone == True: # drone use case
            observation_index = self.header.index('positionX')
            observation1_index = self.header.index('positionY')
            observation2_index = self.header.index('positionZ')
            timestamp_index = self.header.index('timestamp')
            payload = {}
            payload['data_positionX'] = { 'x': np.array(self.training_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.training_data_observation, dtype=object)[:, observation_index].tolist() }
            payload['data_positionY'] = { 'x': np.array(self.training_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.training_data_observation, dtype=object)[:, observation1_index].tolist() }
            payload['data_positionZ'] = { 'x': np.array(self.training_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.training_data_observation, dtype=object)[:, observation2_index].tolist() }
            payload['odesol_guessX'] = { 't': odesol_guess.t.tolist(), 'y': odesol_guess.y[self.mc.x_index_for_properties['positionX']].tolist() }
            payload['odesol_guessY'] = { 't': odesol_guess.t.tolist(), 'y': odesol_guess.y[self.mc.x_index_for_properties['positionY']].tolist() }
            payload['odesol_guessZ'] = { 't': odesol_guess.t.tolist(), 'y': odesol_guess.y[self.mc.x_index_for_properties['positionZ']].tolist() }
            payload['odesol_optX'] = { 't': odesol_opt.t.tolist(), 'y': odesol_opt.y[self.mc.x_index_for_properties['positionX']].tolist() }
            payload['odesol_optY'] = { 't': odesol_opt.t.tolist(), 'y': odesol_opt.y[self.mc.x_index_for_properties['positionY']].tolist() }
            payload['odesol_optZ'] = { 't': odesol_opt.t.tolist(), 'y': odesol_opt.y[self.mc.x_index_for_properties['positionZ']].tolist() }
            payload['t_grid'] = t_grid.tolist() 
            payload['odesol_futureX'] = { 't': odesol_future.t.tolist(), 'y': odesol_future.y[self.mc.x_index_for_properties['positionX']].tolist() } 
            payload['odesol_futureY'] = { 't': odesol_future.t.tolist(), 'y': odesol_future.y[self.mc.x_index_for_properties['positionY']].tolist() } 
            payload['odesol_futureZ'] = { 't': odesol_future.t.tolist(), 'y': odesol_future.y[self.mc.x_index_for_properties['positionZ']].tolist() } 
            payload['future_data_positionX'] = { 'x': np.array(self.test_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.test_data_observation, dtype=object)[:, observation_index].tolist() }
            payload['future_data_positionY'] = { 'x': np.array(self.test_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.test_data_observation, dtype=object)[:, observation1_index].tolist() }
            payload['future_data_positionZ'] = { 'x': np.array(self.test_data_observation, dtype=object)[:, timestamp_index].tolist(), 'y': np.array(self.test_data_observation, dtype=object)[:, observation2_index].tolist() }
            self.resetGlobal() 
            return payload


if __name__ == "__main__":
    learning = Learning()
    payload = learning.main()
    fig, ax = plt.subplots()
    if not learning.isDrone:
        ax.scatter(np.array(payload['data_temperature']['x'])/3600, np.array(payload['data_temperature']['y']), label='measurements')
        ax.scatter(np.array(payload['data_temperature1']['x'])/3600, np.array(payload['data_temperature1']['y']), label='measurements1')
        #ax.scatter(np.array(payload['odesol_guess']['t'])/3600, np.array(payload['odesol_guess']['y']), label='guess')
        #ax.scatter(np.array(payload['odesol_guess1']['t'])/3600, np.array(payload['odesol_guess1']['y']), label='guess1')
        ax.scatter(np.array(payload['odesol_opt']['t'])/3600, np.array(payload['odesol_opt']['y']), label='optimized')
        ax.scatter(np.array(payload['odesol_opt1']['t'])/3600, np.array(payload['odesol_opt1']['y']), label='optimized1')
        ax.scatter(np.array(payload['odesol_future']['t'])/3600, np.array(payload['odesol_future']['y']), label='future')
        ax.scatter(np.array(payload['odesol_future1']['t'])/3600, np.array(payload['odesol_future1']['y']), label='future1')
        ax.scatter(np.array(payload['future_data_temperature']['x'])/3600, np.array(payload['future_data_temperature']['y']), label='future meas')
        ax.scatter(np.array(payload['future_data_temperature1']['x'])/3600, np.array(payload['future_data_temperature1']['y']), label='future meas1')
        
        #ax.scatter(np.array(payload['t_grid'])/3600, payload['heater'], label='heater')
        #ax.scatter(np.array(payload['t_grid'])/3600, payload['cooler'], label='cooler')

        ax.set_xlabel(r'Time $t$', fontsize=15)
        ax.set_ylabel(r'Temperature $T$', fontsize=15)
        ax.set_title('Room temperature')
        ax.legend()
        ax.grid(True)
        fig.tight_layout()
        plt.show()
    elif learning.isDrone: # drone use case
        ax.scatter(np.array(payload['data_positionX']['x'])/3600, np.array(payload['data_positionX']['y']), label='measurementsX')
        ax.scatter(np.array(payload['data_positionY']['x'])/3600, np.array(payload['data_positionY']['y']), label='measurementsY')
        ax.scatter(np.array(payload['data_positionZ']['x'])/3600, np.array(payload['data_positionZ']['y']), label='measurementsZ')
        #ax.scatter(np.array(payload['odesol_guess']['t'])/3600, np.array(payload['odesol_guess']['y']), label='guess')
        #ax.scatter(np.array(payload['odesol_guess1']['t'])/3600, np.array(payload['odesol_guess1']['y']), label='guess1')
        ax.scatter(np.array(payload['odesol_optX']['t'])/3600, np.array(payload['odesol_optX']['y']), label='optimizedX')
        ax.scatter(np.array(payload['odesol_optY']['t'])/3600, np.array(payload['odesol_optY']['y']), label='optimizedY')
        ax.scatter(np.array(payload['odesol_optZ']['t'])/3600, np.array(payload['odesol_optZ']['y']), label='optimizedZ')
        ax.scatter(np.array(payload['odesol_futureX']['t'])/3600, np.array(payload['odesol_futureX']['y']), label='future X')
        ax.scatter(np.array(payload['odesol_futureY']['t'])/3600, np.array(payload['odesol_futureY']['y']), label='future Y')
        ax.scatter(np.array(payload['odesol_futureZ']['t'])/3600, np.array(payload['odesol_futureZ']['y']), label='future Z')
        ax.scatter(np.array(payload['future_data_positionX']['x'])/3600, np.array(payload['future_data_positionX']['y']), label='future data X')
        ax.scatter(np.array(payload['future_data_positionY']['x'])/3600, np.array(payload['future_data_positionY']['y']), label='future data Y')
        ax.scatter(np.array(payload['future_data_positionY']['x'])/3600, np.array(payload['future_data_positionZ']['y']), label='future data Z')
        
        #ax.scatter(np.array(payload['t_grid'])/3600, payload['heater'], label='heater')
        #ax.scatter(np.array(payload['t_grid'])/3600, payload['cooler'], label='cooler')

        ax.set_xlabel(r'Time $t$', fontsize=15)
        ax.set_ylabel(r'Temperature $T$', fontsize=15)
        ax.set_title('Room temperature')
        ax.legend()
        ax.grid(True)
        fig.tight_layout()
        plt.show()