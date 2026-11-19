function dSTATEdt = dynamicModel(~,STATE,CONTROL,params)
    %FMODEL
    %
    % dSTATEdt = Fmodel(time,STATE,CONTROL,params)
    %
    % time
    % STATE = [x, y, z, yaw, vx, vy, vz, yawrate]
    % CONTROL = [throttle, rudder, elevator, aileron]
    % params
    %
    yaw = STATE(4);
    vx = STATE(5);
    vy = STATE(6);
    vz = STATE(7);
    yawrate = STATE(8);
    throttle = CONTROL(1);
    rudder = CONTROL(2);
    elevator = CONTROL(3);
    aileron = CONTROL(4);
    cos_yaw = cos( yaw );
    sin_yaw = sin( yaw );
    R = [cos_yaw, -sin_yaw; sin_yaw, cos_yaw]; % rotation matrix
    dRdt = [-sin_yaw, -cos_yaw; cos_yaw, -sin_yaw] * yawrate;
    vxyBody = R' * [vx; vy]; % xy-velocity in body reference frame
    axBody = params(1) * (params(2) * elevator - vxyBody(1)); % xB-acceleration
    ayBody = params(3) * (params(4) * aileron - vxyBody(2)); % yB-acceleration
    az = params(5) * (params(6) * throttle - vz); % z-acceleration
    axy = R * [axBody; ayBody] + dRdt * vxyBody; % xy-acceleration in global reference frame
    ayaw = params(7) * (params(8) * rudder - yawrate); % psi acceleration
	% dSTATE / dt
    dSTATEdt = [ vx; vy; vz; yawrate; axy(1); axy(2); az; ayaw];
    return
end
