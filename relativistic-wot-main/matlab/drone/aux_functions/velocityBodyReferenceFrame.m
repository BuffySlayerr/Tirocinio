function [vxB, vyB] = velocityBodyReferenceFrame( vx, vy, yaw )
    COSpsi = cos( yaw );
    SINpsi = sin( yaw );
    vxB = COSpsi .* vx + SINpsi .* vy;
    vyB = - SINpsi .* vx + COSpsi .* vy;
    return
end