function controlData = getActions(data)
    controlData = struct();
    controlData.time = data.time;
    controlData.elevator = data.elevator;
    controlData.aileron = data.aileron;
    controlData.throttle = data.throttle;
    controlData.rudder = data.rudder;
    return
end