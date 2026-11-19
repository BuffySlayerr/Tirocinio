function data = dataTimeSelection(data, tmin, tmax)

if isempty(tmin)
    tmin = -inf;
end
if nargin < 3 || isempty(tmax)
    tmax = +inf;
end
if tmin > tmax
    error('tmin should be smaller than tmax')
end

idx = (data.time >= tmin) & (data.time <= tmax);

fields = fieldnames( data );
for i = 1:numel(fields)
    field = fields{ i };
    vec = data.(field);
    vec_idx = vec(idx);
    data.(field) = vec_idx;
end

return
end