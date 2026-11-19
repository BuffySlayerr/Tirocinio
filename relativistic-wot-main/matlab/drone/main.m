clear all %#ok
close all
clc

addpath('aux_functions/'); % import utility functions

foldername = 'Voli/';
% filename = 'Feb-9th-2022-02-56PM-Flight-Airdata.csv';
% filename = 'Volo1-Ver1-Feb-10th-2022-02-10PM-Flight-Airdata.csv';
% filename = 'Volo2-Ver1-Feb-10th-2022-02-30PM-Flight-Airdata.csv';
% filename = 'Volo3-Ver1-Feb-10th-2022-02-47PM-Flight-Airdata.csv';
filename = 'Volo4-Ver1-Feb-10th-2022-03-01PM-Flight-Airdata.csv';

data_original = import_data( [foldername,filename] );

%% data selection and preparation

% training   data for t in [tmin_training, tmax_training  ]
% validation data for t in [tmin_training, tmax_validation]
tmin_training = 73;
tmax_training = 93;
tmax_validation = 103;

training_data = dataTimeSelection( data_original, tmin_training, tmax_training   );

%% plot flight data
close all

hfig1 = figure('Name','Flight trajectory (training)');
plotFlightTrajectory(training_data)
drawnow

hfig2 = figure('Name','Flight data (training)');
plotFlightData(training_data);
drawnow

%% initial guess

% initial state
nstate = 8;
guess_initial_state = zeros(nstate, 1);
guess_initial_state(1) = training_data.x(1);
guess_initial_state(2) = training_data.y(1);
guess_initial_state(3) = training_data.z(1);
guess_initial_state(4) = training_data.yaw(1);
% guess_initial_state(5) = training_data.vx(1);
% guess_initial_state(6) = training_data.vy(1);
% guess_initial_state(7) = training_data.vz(1);

% parameters
nparams = 8;
guess_params = zeros(nparams, 1);
guess_params(1) = 1; % 1
guess_params(2) = 0.01; % 0.05-0.01
guess_params(3) = 1; % 1
guess_params(4) = 0.01; % 0.05-0.01
guess_params(5) = 2; % 2.5-2
guess_params(6) = 0.01; % 0.03-0.01
guess_params(7) = 1; % 1
guess_params(8) = 0.01; % 0.0085-0.01

train_data_actions = getActions(training_data);
train_data_observations = getMeasurements(training_data);

% integrate model
guess_estimate = struct();
guess_estimate.time = training_data.time;
guess_estimate_state = integrateEstimateModel(train_data_actions, @dynamicModel, guess_estimate.time, guess_initial_state, guess_params);
guess_estimate_observations = observationModel(guess_estimate_state, guess_params);
guess_estimate.x = guess_estimate_observations(1,:);
guess_estimate.y = guess_estimate_observations(2,:);
guess_estimate.z = guess_estimate_observations(3,:);
guess_estimate.yaw = guess_estimate_state(4,:);
guess_estimate.vx = guess_estimate_state(5,:);
guess_estimate.vy = guess_estimate_state(6,:);
guess_estimate.vz = guess_estimate_state(7,:);
[guess_estimate.vxB, guess_estimate.vyB] = velocityBodyReferenceFrame( guess_estimate.vx, guess_estimate.vy, guess_estimate.yaw );

%% generate and solve estimation problem
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

[optim_lsqvars, ~, ~, exitflag, output] = lsqnonlin( estimation_problem );

[optim_initial_state, optim_params] = extractParams( optim_lsqvars, nstate);

%% plot solution
validation_data = dataTimeSelection( data_original, tmin_training, tmax_validation );
validation_data_actions = getActions(validation_data);

% plot guess
figure('Name','Initial guess estimate')
plot_data_estimate_validation(training_data, guess_estimate, validation_data)
drawnow

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
figure('Name','Identified model')
plot_data_estimate_validation(training_data, optim_estimate, validation_data)
drawnow
