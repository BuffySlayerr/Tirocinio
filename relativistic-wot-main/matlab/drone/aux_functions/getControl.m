function u = getControl(data, time)
    %GETCONTROL
    %
    % control = getControl(data, time)
    %
    % CONTROL = [elevator, aileron, throttle, rudder]
    all_times = data.time;
    j = find(all_times <= time, 1, 'last');
    u = [data.throttle(j);...
         data.rudder(j);...
         data.elevator(j);...
         data.aileron(j)];
    return
end