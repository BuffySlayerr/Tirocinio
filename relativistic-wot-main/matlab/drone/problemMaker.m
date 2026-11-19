function problem = problemMaker( data_observations, data_actions, dyn_model, obs_model, stateGuess, paramsGuess, fixedParams )
    assert(isvector(stateGuess))
    assert(isvector(paramsGuess))
    nstate = length( stateGuess );
    nparams = length( paramsGuess );
    if nargin < 7 || isempty(fixedParams)
        fixedParams = zeros(nparams,1);
    end
    assert(isvector(fixedParams))
    assert(length(fixedParams) == nparams)
    fixedParams = logical( fixedParams );
    freeParams = ~fixedParams;
    nfreeParams = sum(freeParams);
    problem = struct();
    % objective
    time_obs = data_observations(1,:);
    obs = data_observations(2:end,:);
    problem.objective = @lsfun;
    % starting point
    problem.x0 = [stateGuess; paramsGuess(freeParams)];
    % bounds
    state_lb = -inf(nstate,1);
    state_ub =  inf(nstate,1);
    param_lb =   0 * ones(nfreeParams,1);
    param_ub =  inf(nfreeParams,1);
    problem.lb = [state_lb; param_lb];
    problem.ub = [state_ub; param_ub];
    function f = lsfun(vars)
        [init_state, params] = extractParams(vars, nstate);
        allParams = zeros(nparams,1);
        allParams(fixedParams) = paramsGuess(fixedParams);
        allParams(freeParams) = params;
        state_est = integrateEstimateModel(data_actions, dyn_model, time_obs, init_state, allParams);
        obs_est = obs_model(state_est, allParams);
        f = obs_est(:) - obs(:);
        return
    end
end