import argparse
import math
import numpy as np
import random
import matplotlib.pyplot as plt
import sys
import csv
import json





class FiveLakesSimulator:

    def __init__(self, filename, tfinal, t_step=0.1):
        self.data = []
        self.additionalHardware = {}
        self.NUM_SENSORS = 3
        self.NUM_ACTUATORS = 9
        self.n_reps = 4
        self.n_edges = 9
        self.n_nodes = 5
        self.xmeas_idx_all = list(range(self.n_nodes))  # sensor ids
        self.actions_idx_all = list(range(self.n_edges * self.n_reps))  # actuator ids
        self.actions_default = [0 for i in range(self.n_edges * self.n_reps)]
        self.tfinal = tfinal
        self.xmeas_sigma = 0.02  # measurement noise

        reader = self.read_data(filename)
        actuators = []
        a = self.actions_default
        for row in reader:
            time = float(row[0])
            if len(row) > 1+self.NUM_ACTUATORS:
                additionalHardware = row.pop()
                additionalHardware = additionalHardware.replace("\"", "")
                additionalHardware = additionalHardware.replace("\'", "\"")
                additionalHardware = json.loads(additionalHardware)
                self.additionalHardware[time] = additionalHardware
                # if (time == 1):
                #     self.additionalHardware[time]["actuators"] = [1, 0.4]
                # if (time == 5):
                #     self.additionalHardware[time]["actuators"] = [0, 0]
                # if ()
            #else:
            #    row = [*row, 0, 0, 0, 0]
            #print(row)
            # prima colonna timestamp
            for i in range(self.NUM_ACTUATORS):
                a[self.actions_idx_all[i]] = row[i+1]
            if time in self.additionalHardware and "actuators" in self.additionalHardware[time]:
                actuators = self.additionalHardware[time]["actuators"]
                for i in range(len(actuators)):
                    a[self.actions_idx_all[i + self.NUM_ACTUATORS]] = actuators[i]
            a = self.action_safeguard(a)
            row = [time, *a]
            self.data.append(row)
            #print(row)
        if time < tfinal:
            self.data.append([tfinal + t_step, *self.actions_default])

    @staticmethod
    def read_data(file):
        """
        Read the data from a CSV file or a file-like object.

        Args:
            file (str or file-like object): The path to the CSV file or a file-like object containing the simulation data.

        Returns:
            list: A list of rows read from the CSV file.
        """
        if isinstance(file, str):
            with open(file, newline='') as csvfile:
                reader = csv.reader(csvfile, delimiter=';')
                reader = list(reader)
        else:
            reader = csv.reader(file, delimiter=';')
        return reader

    def dynamics(self, t, state, action):
        #           |u1
        #           x1
        #       ____|____
        #       |u2      |u3
        #       x2       x3
        #       |______  |
        #     u4| ___u6\_|
        #       |/u7    \|u5
        #       x4       x5
        #     u8|        |u9
        assert len(state) == self.n_nodes
        assert len(action) == self.n_edges * self.n_reps
        x1, x2, x3, x4, x5 = state
        sqrtx1 = math.sqrt(x1)
        sqrtx2 = math.sqrt(x2)
        sqrtx3 = math.sqrt(x3)
        sqrtx4 = math.sqrt(x4)
        sqrtx5 = math.sqrt(x5)
        # total controls
        utot = [0 for i in range(self.n_edges)]
        for i in range(self.n_edges):
            utot[i] = sum([action[i + self.n_edges * j] for j in range(self.n_reps)])
        u1, u2, u3, u4, u5, u6, u7, u8, u9 = utot
        # time derivative
        dx1 = u1 - sqrtx1 * (u2 + u3)
        dx2 = u2 * sqrtx1 - sqrtx2 * (u4 + u6)
        dx3 = u3 * sqrtx1 - sqrtx3 * (u5 + u7)
        dx4 = u4 * sqrtx2 + u7 * sqrtx3 - u8 * sqrtx4
        dx5 = u6 * sqrtx2 + u5 * sqrtx3 - u9 * sqrtx5
        return [dx1, dx2, dx3, dx4, dx5]


    def action_safeguard(self, action):
        # safeguard: only values in [0,1] make sense for u
        action = np.asarray(action, float)
        for a in action:
            if a < 0.0:
                raise ValueError
            elif a > 1.0:
                raise ValueError
        return np.maximum(0.0, np.minimum(action, 1.0))


    def state_safeguard(self, state):
        # safeguard: only values >= 0 make sense for x
        return np.maximum(0.0, state)

    def actions(self, t, x):
        l = len(self.data)
        if t >= float(self.data[l - 1][0]):
            return [float(self.data[l-1][j]) for j in range(1, len(self.data[l-1]))]
        for i in range(l - 1):
            if t >= float(self.data[i][0]) and t < float(self.data[i + 1][0]):
                return [float(self.data[i][j]) for j in range(1, len(self.data[i]))]
        # return self.actions_time(t,x)

    def odesolve(self, tinit, tfinal, tstep, stateinit):
        nsteps = math.ceil((tfinal - tinit) / tstep)
        t = tinit
        x = np.asarray(stateinit)
        # allocate variables for storing history
        tsol = np.empty(nsteps + 1)
        tsol[0] = t
        nx = len(x)
        xsol = np.empty((nx, nsteps + 1))
        xsol[:, 0] = x
        u = np.asarray(self.actions(t, x))
        nu = len(u)
        usol = np.empty((nu, nsteps))
        # main loop
        for i in range(0, nsteps):
            u = self.actions(t, x)
            usol[:, i] = u
            dxdt = self.dynamics(t, x, u)
            if i + 1 == nsteps:
                dt = tfinal - t
                t = tfinal
            else:
                dt = tstep
                t = t + dt
            for k in range(nx):
                x[k] += dt * dxdt[k]
            x = self.state_safeguard(x)
            tsol[i + 1] = t
            xsol[:, i + 1] = x
        return tsol, xsol, usol



    def measure_state(self, tsol, xsol):
        t = np.copy(tsol)
        x = np.copy(xsol)
        for i in range(np.shape(x)[0]):
            for j in range(np.shape(x)[1]):
                x[i,j] += random.gauss(0,self.xmeas_sigma)
        x = self.state_safeguard(x)
        return t, x


def parse_arguments():
    """
    Parse command line arguments for the Five Lakes Simulator.

    Returns:
        argparse.Namespace: Parsed command line arguments.
    """
    parser = argparse.ArgumentParser(description='Run the Five Lakes Simulator.')
    parser.add_argument('filename', type=str, help='The path to the CSV file containing the simulation data.')
    parser.add_argument('--xinit', type=float, nargs='+', default=[0.9, 0.9, 0.9, 0.9, 0.9], help='The initial state (default: [0.9, 0.9, 0.9, 0.9, 0.9]).')
    parser.add_argument('--tinit', type=float, default=0.0, help='The initial time (default: 0.0).')
    parser.add_argument('--tfinal', type=float, default=10.0, help='The final time (default: 10.0).')
    parser.add_argument('--tstep', type=float, default=0.1, help='The time step (default: 0.1).')
    return parser.parse_args()


def main(filename, xinit, tinit, tfinal, tstep):
    sim = FiveLakesSimulator(filename, tfinal, tstep)
    tsol, xsol, usol = sim.odesolve(tinit, tfinal, tstep, xinit)

    #xmeas_idx = xmeas_idx_all[:(3+len(sim.additionalHardware.keys()))]
    # if len(sim.additionalHardware.keys()) > 0:



    #xmeas = xsol[:,idx]
    txmeas, xmeas = sim.measure_state(tsol, xsol)

    #umeas_idx = [0,2,3, 5, 7, 8]
    #tumeas, umeas = sim.measure_actions(tsol, usol, umeas_idx)

    can_plot = False
    if can_plot:
        fig, (ax1, ax2) = plt.subplots(2, 1)
        fig.suptitle("States x and actions u")
        for i in range(np.shape(xsol)[0]):
            ax1.plot(tsol, xsol[i, :], "-",label="x"+str(i+1))
        ax1.set_ylabel('state x')
        #for i in range(np.shape(xmeas)[0]):
        #    plt.plot(txmeas, xmeas[i, :], "--")
        ax1.legend()
        for i in range(np.shape(usol)[0]):
            ax2.plot(tsol[:-1], usol[i, :], "-",label="u"+str(i+1))
        # for i in range(np.shape(umeas)[0]):
        #    plt.plot(tumeas[:-1], umeas[i, :],'--')
        ax2.set_ylabel('action u')
        ax2.set_xlabel('time t')
        ax2.legend()
        plt.show()

    rows = []
    # print(tsol)

    additionalSensors = 0
    additionalActuators = []
    for j in range(len(sim.data) - 1):
        row = ['action', float(sim.data[j][0]), -1, -1, -1]
        row = [*row, *[float(sim.data[j][sim.actions_idx_all[z]]) for z in range(1, sim.NUM_ACTUATORS + 1)]]
        if float(sim.data[j][0]) in sim.additionalHardware:
            row.append(str(sim.additionalHardware[float(sim.data[j][0])]))
            additionalHardware = sim.additionalHardware[float(sim.data[j][0])]
            if 'sensors' in additionalHardware:
                additionalSensors = additionalHardware['sensors']
            if 'actuators' in additionalHardware:
                additionalActuators = additionalHardware['actuators']
        rows.append(row)
        t = float(sim.data[j][0])
        next_t = float(sim.data[j + 1][0])
        for i in range(len(tsol)):
            time = tsol[i]
            if time >= t and time < next_t:
                row = ['observation', round(time, 2)]
                row = [*row, *[round(float(xmeas[sim.xmeas_idx_all[z]][i]), 2) for z in range(sim.NUM_SENSORS)]]
                row = [*row, *[round(float(sim.data[j][sim.actions_idx_all[z]]), 2) for z in range(1, sim.NUM_ACTUATORS + 1)]]
                additionalSensorsData = [*[round(float(xmeas[sim.xmeas_idx_all[z]][i]), 2) for z in range(sim.NUM_SENSORS, additionalSensors + sim.NUM_SENSORS)]]

                additionalHardwareJson = {}
                if additionalSensors > 0:
                    # row.append("{'sensors': " + str(additionalSensorsData) + "}")
                    additionalHardwareJson = {'sensors': additionalSensorsData}
                if len(additionalActuators) > 0:
                    additionalActuatorsData = [*[round(float(sim.data[j][1+sim.actions_idx_all[z]]), 2) for z in range(sim.NUM_ACTUATORS, len(additionalActuators) + sim.NUM_ACTUATORS)]]
                    # row.append("{'actuators': " + str(additionalActuatorsData) + "}")
                    additionalHardwareJson['actuators'] = additionalActuatorsData
                    # check if all 0 in additionalActuatorsData
                    if sum(additionalActuatorsData) == 0:
                        additionalHardwareJson = {}
                        additionalActuators = []

                if additionalSensors == 0 and len(additionalActuators) == 0:
                    row.append("n/a")
                else:
                    print(additionalActuators, additionalSensors)
                    row.append(str(additionalHardwareJson))
                rows.append(row)

    # write rows to csv
    with open('output.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(rows)

    return rows


if __name__ == '__main__':
    args = parse_arguments()
    filename = args.filename
    xinit = args.xinit
    tinit = args.tinit
    tfinal = args.tfinal
    tstep = args.tstep
    main(filename, xinit, tinit, tfinal, tstep)
