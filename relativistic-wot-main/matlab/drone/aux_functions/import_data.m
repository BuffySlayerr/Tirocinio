function data = import_data(filename)
%IMPORTFILE Import data from a text file
%  DB = IMPORT_DATA(FILENAME) reads data from text file FILENAME for the
%  default selection.  Returns the data as column vectors.
%
%  DB = IMPORT_DATA(FILE, DATALINES)
%  reads data for the specified row interval(s) of text file FILENAME.
%  Specify DATALINES as a positive scalar integer or a N-by-2 array of
%  positive scalar integers for dis-contiguous row intervals.
%
%  Example:
%  [...] = importfile("Feb-9th-2022-02-56PM-Flight-Airdata.csv", [1, Inf]);
%
%  See also READTABLE.

%% Input handling

%% Setup the Import Options and import the data
opts = delimitedTextImportOptions("NumVariables", 51);

% Specify range and delimiter
opts.DataLines = [2, Inf];
opts.Delimiter = ",";

% Specify column names and types
opts.VariableNames = ["timemillisecond", "Var2", "latitude", "longitude", "height_above_takeofffeet", "Var6", "Var7", "Var8", "Var9", "Var10", "Var11", "Var12", "Var13", "Var14", "Var15", "Var16", "Var17", "Var18", "Var19", "xSpeedmph", "ySpeedmph", "zSpeedmph", "compass_headingdegrees", "pitchdegrees", "rolldegrees", "Var26", "Var27", "Var28", "Var29", "Var30", "Var31", "rc_elevatorpercent", "rc_aileronpercent", "rc_throttlepercent", "rc_rudderpercent", "Var36", "Var37", "Var38", "Var39", "Var40", "Var41", "Var42", "Var43", "Var44", "Var45", "Var46", "Var47", "Var48", "Var49", "Var50", "Var51"];
opts.SelectedVariableNames = ["timemillisecond", "latitude", "longitude", "height_above_takeofffeet", "xSpeedmph", "ySpeedmph", "zSpeedmph", "compass_headingdegrees", "pitchdegrees", "rolldegrees", "rc_elevatorpercent", "rc_aileronpercent", "rc_throttlepercent", "rc_rudderpercent"];
opts.VariableTypes = ["double", "string", "double", "double", "double", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "double", "double", "double", "double", "double", "double", "string", "string", "string", "string", "string", "string", "double", "double", "double", "double", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string"];

% Specify file level properties
opts.ExtraColumnsRule = "ignore";
opts.EmptyLineRule = "read";

% Specify variable properties
opts = setvaropts(opts, ["Var2", "Var6", "Var7", "Var8", "Var9", "Var10", "Var11", "Var12", "Var13", "Var14", "Var15", "Var16", "Var17", "Var18", "Var19", "Var26", "Var27", "Var28", "Var29", "Var30", "Var31", "Var36", "Var37", "Var38", "Var39", "Var40", "Var41", "Var42", "Var43", "Var44", "Var45", "Var46", "Var47", "Var48", "Var49", "Var50", "Var51"], "WhitespaceRule", "preserve");
opts = setvaropts(opts, ["Var2", "Var6", "Var7", "Var8", "Var9", "Var10", "Var11", "Var12", "Var13", "Var14", "Var15", "Var16", "Var17", "Var18", "Var19", "Var26", "Var27", "Var28", "Var29", "Var30", "Var31", "Var36", "Var37", "Var38", "Var39", "Var40", "Var41", "Var42", "Var43", "Var44", "Var45", "Var46", "Var47", "Var48", "Var49", "Var50", "Var51"], "EmptyFieldRule", "auto");

% Import the data
tbl = readtable(filename, opts);

%% Convert to output type
time = tbl.timemillisecond;
latitude = tbl.latitude;
longitude = tbl.longitude;
height = tbl.height_above_takeofffeet;
vx = tbl.xSpeedmph;
vy = tbl.ySpeedmph;
vz = tbl.zSpeedmph;
roll = tbl.rolldegrees;
pitch = tbl.pitchdegrees;
yaw = tbl.compass_headingdegrees;
elevator = tbl.rc_elevatorpercent;
aileron = tbl.rc_aileronpercent;
throttle = tbl.rc_throttlepercent;
rudder = tbl.rc_rudderpercent;

% convert units
time = 1e-3 * time; % [s]
z = 0.3048 * height; % [m]
vx = 0.44704 * vx; % [m/s]
vy = 0.44704 * vy; % [m/s]
vz = 0.44704 * vz; % [m/s]
roll = (pi/180) * roll; % [rad]
pitch = (pi/180) * pitch; % [rad]
yaw = (pi/180) * yaw; % [rad]

% shift and scale latitude and longitude to local x-y coordinates
% This step should result in better scaling for the estimation problem
latitude_shift = latitude(1);
longitude_shift = longitude(1);
latitude_scale = 111798; % [m/°] in Bologna
longitude_scale = 79243; % [m/°] in Bologna
x  = latitude_scale * (latitude  - latitude_shift ); % [m]
y = longitude_scale * (longitude - longitude_shift); % [m]

% fix sign
vz = - vz; % why ?

% velocity in body reference frame
[vxB, vyB] = velocityBodyReferenceFrame( vx, vy, yaw );

% unwrap yaw angle
idx = ((yaw(1:end-1) < 0.1) & (yaw(2:end) > 2*pi-0.1)) | ...
      ((yaw(1:end-1) > 2*pi-0.1) & (yaw(2:end) < 0.1));
nidx = find( idx );
if ~isempty(nidx)
    yaw_temp = yaw;
    for i=1:length(nidx)
        idx = nidx(i);
        if ((yaw(idx) < 0.1) && (yaw(idx+1) > 2*pi-0.1))
            yaw_temp(idx+1:end) = yaw_temp(idx+1:end) - 2*pi;
        else
            yaw_temp(idx+1:end) = yaw_temp(idx+1:end) + 2*pi;
        end
    end
    yaw = yaw_temp;
end

% data structure
data = struct();
data.time = time;
data.x = x;
data.y = y;
data.z = z;
data.elevator = elevator;
data.aileron = aileron;
data.throttle = throttle;
data.rudder = rudder;

data.vx = vx;
data.vy = vy;
data.vxB = vxB;
data.vyB = vyB;
data.vz = vz;
data.yaw = yaw;
data.pitch = pitch;
data.roll = roll;

end