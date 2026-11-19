function state = integrateEstimateModel(controlData, dynamicsFun, tspan, init_state, params)
    options = odeset('RelTol',1e-9,'AbsTol',1e-9);
    [~, state] = ode45( @odefun, tspan, init_state, options);
    function dSTATEdt = odefun(time, STATE)
        CONTROL = getControl( controlData, time );
        dSTATEdt = dynamicsFun(time, STATE, CONTROL, params);
    end
    state = state'; % [nstate x ntimes]
    return
end