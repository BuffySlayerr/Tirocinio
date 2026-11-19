clear all %#ok
close all
clc

filename = 'output.csv';
out = readtable( filename );

n = length( out.operation );

DATA = struct();
DATA.isMeasure = false(n,1);
DATA.isAction = false(n,1);
DATA.timestamp = out.timestamp(:);
DATA.temperature = out.temperature(:);
DATA.heater = false(n,1);
DATA.cooler = false(n,1);
for i=1:n
    switch out.operation{i}
        case 'temperature'
            DATA.isMeasure(i) = true;
        case 'action'
            DATA.isAction(i) = true;
    end
    DATA.heater(i) = strcmp( out.heater{i}, 'true' );
    DATA.cooler(i) = strcmp( out.cooler{i}, 'true' );
end

%%
MONITOR = struct();
MONITOR.temperature.time  = DATA.timestamp(DATA.isMeasure);
MONITOR.temperature.value = DATA.temperature(DATA.isMeasure);
MONITOR.temperature.npts  = length( MONITOR.temperature.value );
MONITOR.heater.time  = DATA.timestamp(DATA.isAction);
MONITOR.heater.value = DATA.heater(DATA.isAction);
MONITOR.heater.npts  = length( MONITOR.heater.value );
MONITOR.cooler.time  = DATA.timestamp(DATA.isAction);
MONITOR.cooler.value = DATA.cooler(DATA.isAction);
MONITOR.cooler.npts  = length( MONITOR.cooler.value );

figure
hold on, grid on, box on, axis tight
plot(MONITOR.temperature.time/3600, MONITOR.temperature.value,'r.','DisplayName','observed')
xlabel('time [h]')
ylabel('temperature')
legend('show')
drawnow

%% generate dynamic estimation problem

dynamicModel = @Fmodel;
estimationProblem = problemMaker( MONITOR, dynamicModel );

switch estimationProblem.solver
    case 'lsqnonlin'
        [x, ~, ~, exitflag, output] = lsqnonlin( estimationProblem );
    case 'fmincon'
        [x, ~, exitflag, output] = fmincon( estimationProblem );
end
estimationSolution = struct();
estimationSolution.x = x;
estimationSolution.output = output;
estimationSolution.exitflag = exitflag;

[params, T0] = extractParams( estimationSolution.x );

Tobs_est = integrateEstimateModel(MONITOR, dynamicModel, MONITOR.temperature.time, T0, params);
rmsError = sqrt( sum( ( MONITOR.temperature.value(:) - Tobs_est(:) ).^2 ) / MONITOR.temperature.npts );
disp(rmsError);

tgrd = MONITOR.temperature.time(1):60:MONITOR.temperature.time(end);
Tgrd_est = integrateEstimateModel(MONITOR, dynamicModel, tgrd, T0, params);

plot(tgrd/3600, Tgrd_est,'b-','DisplayName','estimated')
drawnow

%% plot heater/cooler
BHgrd = 0 * tgrd;
BCgrd = 0 * tgrd;
for i=1:length(tgrd)
    BHgrd(i) = getTimeState(tgrd(i), MONITOR.heater.time, MONITOR.heater.value);
    BCgrd(i) = getTimeState(tgrd(i), MONITOR.cooler.time, MONITOR.cooler.value);
end

figure
hold on, grid on, box on, axis tight
plot(tgrd/3600, BHgrd,'r.-','DisplayName','heater')
plot(tgrd/3600, BCgrd,'b.-','DisplayName','cooler')
xlabel('time [h]')
% ylabel('temperature')
legend('show')
drawnow


% dynamics model
function dTdt = Fmodel(T,BH,BC,params)
    dTdt = params(1) + params(2)*T + params(3)*BH + params(4)*BC + params(5)*BC*BH;
end

% direct single shooting
function p = problemMaker( monitor, Fmodel )
    p = struct();
    p.objective = @ffun;
    p.x0 = [15; 1e-3; -1e-4; 1e-3; -1e-3; 1e-5]; % initial guess
    p.solver = 'lsqnonlin';
    p.options = optimoptions(p.solver, ...
        'Display','iter-detailed',...
        'FunctionTolerance',1e-9,...
        'OptimalityTolerance',1e-9,...
        'StepTolerance',1e-9,...
        'MaxIterations',500,...
        'MaxFunctionEvaluations',5000);
    function f = ffun(vars)
        [params, T0] = extractParams(vars);
        tobs = monitor.temperature.time;
        Tobs = monitor.temperature.value;
        Test = integrateEstimateModel(monitor, Fmodel, tobs, T0, params);
        f = Test(:) - Tobs(:);
    end
end

function Test = integrateEstimateModel(monitor, Fmodel, tspan, T0, params)
    options = odeset('RelTol',1e-9,'AbsTol',1e-9);
    [~,Test] = ode45( @odefun, tspan, T0, options);
    function dTdt = odefun(t,T)
        BH = getTimeState(t, monitor.heater.time, monitor.heater.value);
        BC = getTimeState(t, monitor.cooler.time, monitor.cooler.value);
        dTdt = Fmodel(T, BH, BC, params);
    end
end

function s = getTimeState(t, tAll, sAll)
    j = find(tAll <= t, 1, 'last');
    s = sAll(j);
end

function [params, T0] = extractParams(vars)
    assert( isvector(vars) );
    T0 = vars(1);
    params = vars(2:end);
end



