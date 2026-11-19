function plot_data_estimate_guess(data, esti)

tiledlayout('flow','TileSpacing','compact')
nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.latitude, '.-','DisplayName','latitude')
plot(esti.time, esti.latitude, '-','DisplayName','estimate')
legend show
nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.longitude, '.-','DisplayName','longitude')
plot(esti.time, esti.longitude, '-','DisplayName','estimate')
legend show
nexttile
hold on, grid on, box on, axis tight
plot(data.time, data.height, '.-','DisplayName','height')
plot(esti.time, esti.height, '-','DisplayName','estimate')
legend show
if isfield(esti,'yaw')
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, data.yaw, '.-','DisplayName','yaw')
    plot(esti.time, esti.yaw, '-','DisplayName','estimate')
    legend show
end
if isfield(esti,'vx')
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, data.vx, '.-','DisplayName','vx')
    plot(esti.time, esti.vx, '-','DisplayName','estimate')
    ylim([-5,5])
    legend show
end
if isfield(esti,'vy')
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, data.vy, '.-','DisplayName','vy')
    plot(esti.time, esti.vy, '-','DisplayName','estimate')
    ylim([-5,5])
    legend show
end
if isfield(esti,'vxB')
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, data.vxB, '.-','DisplayName','vxB')
    plot(esti.time, esti.vxB, '-','DisplayName','estimate')
    ylim([-5,5])
    legend show
end
if isfield(esti,'vyB')
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, data.vyB, '.-','DisplayName','vyB')
    plot(esti.time, esti.vyB, '-','DisplayName','estimate')
    ylim([-5,5])
    legend show
end
if isfield(esti,'vz')
    nexttile
    hold on, grid on, box on, axis tight
    plot(data.time, data.vz, '.-','DisplayName','vz')
    plot(esti.time, esti.vz, '-','DisplayName','estimate')
    legend show
end
xlabel('time [s]')

return
end