function plotFlightData(data)

hasYaw = (isfield(data, 'yaw'));
hasVelocity = (isfield(data, 'vx') && isfield(data, 'vy'));
hasVelocityBody = hasYaw && hasVelocity;
if hasVelocityBody
    [vxBody, vyBody] = velocityBodyReferenceFrame( data.vx, data.vy, data.yaw );
end

tiledlayout(3,4,'TileSpacing','compact')
nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.x, 'b.-','DisplayName','x')
legend show

nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.elevator, 'b.-','DisplayName','elevator')
plot(data.time, data.aileron, 'r.-','DisplayName','aileron')
legend show

nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.throttle, 'k.-','DisplayName','throttle')
legend show

nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.rudder, 'm.-','DisplayName','rudder')
legend show

nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.y, 'r.-','DisplayName','y')
legend show

if hasVelocityBody
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, vxBody, 'b.-','DisplayName','vx B')
    plot(data.time, vyBody, 'r.-','DisplayName','vy B')
    ylim([-5,5])
    legend show
end

if isfield(data, 'vz')
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, data.vz, 'k.-','DisplayName','vz')
    legend show
end

if hasYaw
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, data.yaw, 'm.-','DisplayName','yaw') % yaw <- rudder
    legend show
end

if hasVelocity
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, data.vx, 'b.-','DisplayName','vx')
    plot(data.time, data.vy, 'r.-','DisplayName','vy')
    ylim([-5,5])
    legend show
end

nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.roll, 'r.-','DisplayName','roll') % roll <- aileron
plot(data.time, data.pitch, 'b.-','DisplayName','pitch') % pitch <- elevator
legend show

nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.z, 'k.-','DisplayName','z')
legend show

end

