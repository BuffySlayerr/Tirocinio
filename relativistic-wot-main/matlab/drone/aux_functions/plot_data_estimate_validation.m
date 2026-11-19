function plot_data_estimate_validation(data, esti, data_validation)

% lightgray = 0.83 * [1,1,1];
lnwd = 1.2;
tmax_training = max( data.time );
tmax_validation = max( data_validation.time );
idxvalid = (data_validation.time > tmax_training);

% plot
tiledlayout('flow','TileSpacing','compact')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.x(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.x, 'b.-','DisplayName','latitude')
plot(esti.time, esti.x, 'r-','DisplayName','estimate','LineWidth',lnwd)
%     legend show
ylabel('latitude')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.y(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.y, 'b.-','DisplayName','longitude')
plot(esti.time, esti.y, 'r-','DisplayName','estimate','LineWidth',lnwd)
%     legend show
ylabel('longitude')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.z(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.z, 'b.-','DisplayName','height')
plot(esti.time, esti.z, 'r-','DisplayName','estimate','LineWidth',lnwd)
%     legend show
ylabel('height')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.yaw(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.yaw, 'b.-','DisplayName','yaw')
plot(esti.time, esti.yaw, 'r-','DisplayName','estimate','LineWidth',lnwd)
%     legend show
ylabel('yaw')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.vx(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.vx, 'b.-','DisplayName','vx')
plot(esti.time, esti.vx, 'r-','DisplayName','estimate','LineWidth',lnwd)
%     legend show
ylabel('vx')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.vy(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.vy, 'b.-','DisplayName','vy')
plot(esti.time, esti.vy, 'r-','DisplayName','estimate','LineWidth',lnwd)
%     legend show
ylabel('vy')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.vz(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.vz, 'b.-','DisplayName','vz')
plot(esti.time, esti.vz, 'r-','DisplayName','estimate','LineWidth',lnwd)
%     legend show
ylabel('vz')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.elevator(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.elevator, 'b.-','DisplayName','vx')
ylabel('elevator')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.aileron(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.aileron, 'b.-','DisplayName','vx')
ylabel('aileron')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.throttle(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.throttle, 'b.-','DisplayName','vx')
ylabel('throttle')

nexttile
hold on, box on, axis tight
if tmax_validation > tmax_training
    xline(tmax_training,'k-','HandleVisibility','off')
    plot(data_validation.time(idxvalid), data_validation.rudder(idxvalid), 'b:','HandleVisibility','off')
end
plot(data.time, data.rudder, 'b.-','DisplayName','rudder')
ylabel('rudder')
% xlabel('time [s]')

% nexttile
% hold on, box on, axis tight
% if tmax_validation > tmax_training
%     xline(tmax_training,'k-','HandleVisibility','off')
%     plot(data_validation.time(idxvalid), data_validation.vxB(idxvalid), 'b:','HandleVisibility','off')
% end
% plot(data.time, data.vxB, 'b.-','DisplayName','vxB')
% plot(esti.time, esti.vxB, 'r-','DisplayName','estimate','LineWidth',lnwd)
% %     legend show
% ylabel('vxB')
% xlabel('time [s]')

% nexttile
% hold on, box on, axis tight
% if tmax_validation > tmax_training
%     xline(tmax_training,'k-','HandleVisibility','off')
%     plot(data_validation.time(idxvalid), data_validation.vyB(idxvalid), 'b:','HandleVisibility','off')
% end
% plot(data.time, data.vyB, 'b.-','DisplayName','vyB')
% plot(esti.time, esti.vyB, 'r-','DisplayName','estimate','LineWidth',lnwd)
% %     legend show
% ylabel('vyB')
% xlabel('time [s]')

return
end