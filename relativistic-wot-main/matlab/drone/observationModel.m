function MEAS = observationModel(STATE, ~)
    % STATE = [x, y, z, yaw, vx, vy, vz, vpsi]
    % MEAS  = [x, y, z]
    nmeas = 3;
    nstate = 8;
    assert( size(STATE,1) == nstate )
    MEAS = STATE(1:nmeas,:);
    return
end
