function [init_state, params] = extractParams(vars, nstate)
    assert( isvector(vars) );
    init_state = vars(1:nstate);
    params = vars(nstate+1:end);
    return
end