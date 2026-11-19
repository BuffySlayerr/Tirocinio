from enum import unique
import json
import re
import numpy as np
from collections import Counter



class ModelConductor:

    params_counter = 0
    index_for_globals = {}
    alg_properties = []
    dif_properties = []
    obs_properties = []
    xy_for_properties = {}
    x_index_for_properties = {}
    y_index_for_properties = {}
    input_model_properties = {}
    bounds_model_properties = {}
    bounds_input_model_properties = {}
    iguess_model_properties = {}
    iguess_input_model_properties = {}
    lowerBounds = []
    upperBounds = []
    iguess = []
    properties = {}
    isDrone = True

    def __init__(self, _isDrone):
        self.isDrone = _isDrone
        # Opening JSON file
        if self.isDrone:
            f = open('./thingDrone.jsonld',)
        else:
            f = open('./thing.jsonld',)
        data = json.load(f)
        self.properties = data['properties']
        f.close()

    def adjust_self_model(self, model, new_self):
        return model.replace("self", new_self)

    def adjust_params_model(self, model, index, bounds, iguess):
        counter = 0
        m = re.findall("params\[(.*?)\]", model)
        bounds = '' if bounds == None else bounds
        iguess = '' if iguess == None else iguess
        if not m == None:
            for par in Counter(m).keys():
                idx = int(par) + index
                model = model.replace('params[' + par + ']', 'paramsTMP[' + str(idx) + ']')
                bounds = bounds.replace('params[' + par + ']', 'paramsTMP[' + str(idx) + ']')
                iguess = iguess.replace('params[' + par + ']', 'paramsTMP[' + str(idx) + ']')
                counter = counter + 1
            model = model.replace('paramsTMP[', 'params[')
            bounds = bounds.replace('paramsTMP[', 'params[')
            iguess = iguess.replace('paramsTMP[', 'params[')
        m = re.findall("global\[(.*?)\]", model)
        bounds = '' if bounds == None else bounds
        iguess = '' if iguess == None else iguess
        if not m == None:
            for par in Counter(m).keys():
                if par in self.index_for_globals:
                    idx = self.index_for_globals[par]
                else:
                    idx = index + counter
                    self.index_for_globals[par] = idx
                    counter = counter + 1
                model = model.replace('global[' + par + ']', 'globalTMP[' + str(idx) + ']')
                bounds = bounds.replace('global[' + par + ']', 'globalTMP[' + str(idx) + ']')
                iguess = iguess.replace('global[' + par + ']', 'globalTMP[' + str(idx) + ']')
            model = model.replace('globalTMP[', 'params[')
            bounds = bounds.replace('globalTMP[', 'params[')
            iguess = iguess.replace('globalTMP[', 'params[')
        bounds = None if bounds == '' else bounds
        iguess = '' if bounds == None else iguess
        return [model, counter, bounds, iguess]

    def adjust_input_model(self, name, model):
        res = []
        m = re.findall("input\((.*?)\)", model)
        if not m == None:
            modelInputs = self.input_model_properties[name]
            #print(modelInputs)
            for title in Counter(m).keys():
                el = [x for x in modelInputs if x['title'] == title][0]
                imodel = el['model']
                model = model.replace('input(' + title + ')', imodel)
        m = re.findall("sum\(inputType\((.*?)\)\)", model)
        if not m == None:
            modelInputs = self.input_model_properties[name]
            for model_type in Counter(m).keys():
                els = ['(' + x['model'].split('|')[0] + ')' for x in modelInputs if ('modelType' in x and x['modelType'] == model_type)]
                models_string = ('+'.join(els))
                model = model.replace('sum(inputType(' + model_type + '))', '(' + models_string + ')')
        return model

    def adjust_self_value(self, model, propName):
        imodel = model
        imodel = imodel.replace('self', self.xy_for_properties[propName])
        imodel = imodel.replace('value()', 'self.readProperty("' + propName + '",timestamp,tmp_data)')
        return imodel


    def resetGlobal(self):
        self.params_counter = 0
        self.alg_properties = []
        self.dif_properties = []
        self.obs_properties = []
        self.xy_for_properties = {}
        self.x_index_for_properties = {}
        self.y_index_for_properties = {}
        self.input_model_properties = {}
        self.bounds_model_properties = {}
        self.bounds_input_model_properties = {}
        self.lowerBounds = []
        self.upperBounds = []
        if self.isDrone:
            self.f = open('./thingDrone.jsonld',)
        else:
            self.f = open('./thing.jsonld',)
        # self.f = open('./thingDrone.jsonld',)
        self.data = json.load(self.f)
        self.properties = self.data['properties']

    def makeModel(self): 
        for key in self.properties:
            prop = self.properties[key]
            if 'valueFrom' in prop and prop['valueFrom'] == 'readProperty':
                self.obs_properties.append(key)
            # extract model
            if 'model' in prop:
                tmp_split =  prop['model'].replace(" ", "").split('|')
                model = tmp_split[0] #property.model
                bounds = tmp_split[1] if len(tmp_split) > 1 else None
                iguess = tmp_split[2] if len(tmp_split) > 2 else None
                if not bounds == None and not bounds == '':
                    bounds = bounds.replace(" ", "")
                    # TODO check if valid string for bound
                    self.bounds_model_properties[key] = bounds
                else:
                    self.bounds_model_properties[key] = None
                if not iguess == None and not iguess == '':
                    iguess = iguess.replace(" ", "")
                    # TODO check if valid string for bound
                    self.iguess_model_properties[key] = iguess
                else:
                    self.iguess_model_properties[key] = None
                prop['model'] = model
                # check if algebraic or differential
                if  model.startswith('self='):
                    self.alg_properties.append(key)
                else:
                    self.dif_properties.append(key)
            if 'modelInput' in prop:
                self.input_model_properties[key] = prop['modelInput']

        # count properties
        self.num_alg_properties = len(self.alg_properties)
        #print(alg_properties)
        self.num_dif_properties = len(self.dif_properties)
        #print(dif_properties)
        total_number = self.num_alg_properties + self.num_dif_properties

        counter = 0
        tot_counter = 0

        for prop in self.alg_properties:
            self.xy_for_properties[prop] = "y[" + str(counter) + "]"
            self.y_index_for_properties[prop] = counter
            counter += 1
        counter = 0
        for prop in self.dif_properties:
            self.xy_for_properties[prop] = "x[" + str(counter) + "]"
            self.x_index_for_properties[prop] = counter
            counter += 1
        for key in self.properties: # the property name
            prop = self.properties[key] # the whole property
            if 'modelInput' in prop:
                inputs = self.input_model_properties[key]
                propName = key
                for input in inputs:
                    tmp_split = input['model'].replace(" ", "").split('|')
                    imodel = tmp_split[0] #modelInput.model
                    bounds = tmp_split[1] if len(tmp_split) > 1 else None
                    iguess = tmp_split[2] if len(tmp_split) > 2 else None
                    if not bounds == None:
                        bounds = bounds.replace(" ", "")
                        # TODO check if valid string for bound
                        if not propName in self.bounds_input_model_properties:
                            self.bounds_input_model_properties[propName] = {}
                            # print(self.bounds_input_model_properties)
                    if not iguess == None:
                        iguess = iguess.replace(" ", "")
                        # TODO check if valid string for iguess
                        if not propName in self.iguess_input_model_properties:
                            self.iguess_input_model_properties[propName] = {}
                            #print(self.iguess_input_model_properties)
                    if 'propertyName' in input:
                        propName = input['propertyName'] # if self in model then propertyName in input for definition, otherwise it is a value
                    imodel = self.adjust_self_value(imodel, propName)
                    [imodel, how_many, bounds, iguess] = self.adjust_params_model(imodel, self.params_counter, bounds, iguess)
                    if not bounds == None and not bounds == '':
                        self.bounds_input_model_properties[key][input['title']] = bounds
                    if not iguess == None and not iguess == '':
                        self.iguess_input_model_properties[key][input['title']] = iguess
                    # global params_counter
                    self.params_counter += how_many
                    input['model'] = imodel
            if 'model' in prop:
                model = prop['model'] # it has been already fixed
                model = self.adjust_self_value(model, key)
                bounds =  self.bounds_model_properties[key]
                iguess =  self.iguess_model_properties[key]
                [model, how_many, bounds, iguess] = self.adjust_params_model(model, self.params_counter, bounds, iguess)
                self.bounds_model_properties[key] = bounds
                self.iguess_model_properties[key] = iguess
                # global params_counter
                self.params_counter += how_many
                if key in self.input_model_properties:
                    model = self.adjust_input_model(key, model)
                prop['model'] = model
                # print('model')
                # print(model)

        self.lowerBounds = [-np.inf] * self.params_counter
        self.upperBounds = [np.inf] * self.params_counter
        self.iguess = [1.0] * self.params_counter
        for propName in self.bounds_model_properties:
            strBounds = self.bounds_model_properties[propName]
            if strBounds == None:
                continue
            for el in strBounds.split(','):
                m = re.findall("params\[(.*?)\]", el)
                if not m == None:
                    for par in Counter(m).keys():
                        # params[x] <= ub, params[x] >= lb
                        if '>=' in el:
                            value = float(el.split('>=')[1])
                            self.lowerBounds[int(par)] = value
                        elif '<=' in el:
                            value = float(el.split('<=')[1])
                            self.upperBounds[int(par)] = value
                        else:
                            raise ValueError('Wrong operator for bounds')
        for propName in self.bounds_input_model_properties:
            for modelInput in self.bounds_input_model_properties[propName]:
                strBounds = self.bounds_input_model_properties[propName][modelInput]
                if strBounds == None:
                    continue
                for el in strBounds.split(','):
                    m = re.findall("params\[(.*?)\]", el)
                    if not m == None:
                        for par in Counter(m).keys():
                            # params[x] <= ub, params[x] >= lb
                            if '>=' in el:
                                value = float(el.split('>=')[1])
                                self.lowerBounds[int(par)] = value
                            elif '<=' in el:
                                value = float(el.split('<=')[1])
                                self.upperBounds[int(par)] = value
                            else:
                                raise ValueError('Wrong operator for bounds')
        for propName in self.iguess_model_properties:
            strIguess = self.iguess_model_properties[propName]
            if strIguess == None:
                continue
            #print(strIguess)
            for el in strIguess.split(','):
                m = re.findall("params\[(.*?)\]", el)
                if not m == None:
                    for par in Counter(m).keys():
                        if '=' in el:
                            value = float(el.split('=')[1])
                            self.iguess[int(par)] = value
                        else:
                            raise ValueError('Wrong operator for iguess')
        for propName in self.iguess_input_model_properties:
            for modelInput in self.iguess_input_model_properties[propName]:
                strIguess = self.iguess_input_model_properties[propName][modelInput]
                if strIguess == None:
                    continue
                #print(strIguess)
                for el in strIguess.split(','):
                    m = re.findall("params\[(.*?)\]", el)
                    if not m == None:
                        for par in Counter(m).keys():
                            # TODO: make a stricter check for '='
                            if '=' in el:
                                value = float(el.split('=')[1])
                                self.iguess[int(par)] = value
                            else:
                                raise ValueError('Wrong operator for iguess')

        print('params_counter: ' + str(self.params_counter))
        # Closing file

    def model_Fmodel(self):
        y_arr = []
        for y in self.alg_properties:
            model = self.properties[y]['model']
            y_arr.append(model)
        x_arr = []
        for x in self.dif_properties:
            model = self.properties[x]['model']
            m = re.findall("dot\(x\[(.*?)\]\)", model)
            if not m == None and len(m) > 0:
                model = model.replace('dot(x[' + m[0] + '])', 'dxdt[' + m[0] + ']')
                x_arr.append(model)
        return [y_arr, x_arr]