clear all %#ok
close all
clc

addpath('aux_functions/'); % import utility functions

foldername = 'Voli/';
filename = 'Volo4-Ver1-Feb-10th-2022-03-01PM-Flight-Airdata.csv';

data_original = import_data( [foldername,filename] );

%% data selection and preparation

% training   data for t in [tmin_training, tmax_training  ]
tmin_training = 73;
tmax_training_vec = [78, 83, 88, 93];
% validation data for t in [tmin_training, tmax_validation]
tmax_validation = 98;

% validation data
validation_data = dataTimeSelection( data_original, tmin_training, tmax_validation );
validation_data_actions = getActions(validation_data);

% dimensions
nstate = 8;
nparams = 8;

% loop over spawning times
for i = 1:length(tmax_training_vec)
    tmax_training = tmax_training_vec(i);
    training_data = dataTimeSelection( data_original, tmin_training, tmax_training   );
    train_data_actions = getActions(training_data);
    train_data_observations = getMeasurements(training_data);

    if i > 1
        % warm-started initial guess
        guess_initial_state = optim_initial_state;
        guess_params = optim_params;
    else
        % first initial guess
        % initial state
        guess_initial_state = zeros(nstate, 1);
        guess_initial_state(1) = training_data.x(1);
        guess_initial_state(2) = training_data.y(1);
        guess_initial_state(3) = training_data.z(1);
        guess_initial_state(4) = training_data.yaw(1);
        % guess_initial_state(5) = training_data.vx(1);
        % guess_initial_state(6) = training_data.vy(1);
        % guess_initial_state(7) = training_data.vz(1);

        % parameters
        guess_params = zeros(nparams, 1);
        guess_params(1) = 1; % 1
        guess_params(2) = 0.01; % 0.05-0.01
        guess_params(3) = 1; % 1
        guess_params(4) = 0.01; % 0.05-0.01
        guess_params(5) = 2; % 2.5-2
        guess_params(6) = 0.01; % 0.03-0.01
        guess_params(7) = 1; % 1
        guess_params(8) = 0.01; % 0.0085-0.01
    end
    
    % generate estimation problem
    estimation_problem = problemMaker( train_data_observations, train_data_actions, @dynamicModel, @observationModel, ...
        guess_initial_state, guess_params );
    estimation_problem.solver = 'lsqnonlin';
    estimation_problem.options = optimoptions(estimation_problem.solver, ...
        'Display','iter-detailed',...
        'MaxIterations', 100,...
        'MaxFunctionEvaluations', 1000,...
        'FunctionTolerance',1e-12,...
        'OptimalityTolerance',1e-12,...
        'StepTolerance',1e-12);

    % solve estimation problem
    [optim_lsqvars, ~, ~, exitflag, output] = lsqnonlin( estimation_problem );
    
    [optim_initial_state, optim_params] = extractParams( optim_lsqvars, nstate);

    % integrate model
    optim_estimate = struct();
    optim_estimate.time = validation_data.time;
    optim_estimate_state = integrateEstimateModel(validation_data_actions, @dynamicModel, optim_estimate.time, optim_initial_state, optim_params);
    optim_estimate_observations = observationModel(optim_estimate_state, optim_params);
    optim_estimate.x = optim_estimate_observations(1,:);
    optim_estimate.y = optim_estimate_observations(2,:);
    optim_estimate.z = optim_estimate_observations(3,:);
    optim_estimate.yaw = optim_estimate_state(4,:);
    optim_estimate.vx = optim_estimate_state(5,:);
    optim_estimate.vy = optim_estimate_state(6,:);
    optim_estimate.vz = optim_estimate_state(7,:);
    [optim_estimate.vxB, optim_estimate.vyB] = velocityBodyReferenceFrame( optim_estimate.vx, optim_estimate.vy, optim_estimate.yaw );

    % plot
    figname = ['Identified model, training ',num2str(tmin_training),'-',num2str(tmax_training)];
    figure('Name', figname)
    plot_data_estimate_validation(training_data, optim_estimate, validation_data)
    drawnow
end
