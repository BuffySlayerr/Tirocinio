function plotFlightTrajectory(data)

x = data.x;
y = data.y;
z = data.z;

plot3(x, y, z,'.-')
if isfield(data,'yaw')
    yaw = data.yaw;
    cos_yaw = cos( yaw );
    sin_yaw = sin( yaw );
    
    hold on, grid on, box on, axis tight
    quiver3(x, y, z, cos_yaw, sin_yaw, zeros(size(yaw)), 0)
end
xlabel('x')
ylabel('y')
zlabel('z')

return
end