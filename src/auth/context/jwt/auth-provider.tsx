import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType } from '../../types';

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);
      if (!accessToken || !isValidToken(accessToken)) {
        setSession(null);
        dispatch({ type: Types.INITIAL, payload: { user: null } });
        return;
      }

      setSession(accessToken);

      const res = await axios.get(endpoints.auth.me);

      const resource = res?.data?.data?.resource?.data;
      const attr = resource?.attributes;

      const user =
        resource && attr
          ? {
              id: String(attr.id ?? resource.id ?? ''),
              email: attr.email,
              role: resource.type ?? 'admin',
              accessToken,
            }
          : null;

      dispatch({ type: Types.INITIAL, payload: { user } });
    } catch (e) {
      console.error('Auth init error:', e);
      setSession(null);
      dispatch({ type: Types.INITIAL, payload: { user: null } });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const payload = {
          admin: { email, password },
        };

        const res = await axios.post(endpoints.auth.login, payload);

        const apiData = res?.data?.data;
        const token: string | undefined = apiData?.token;
        const resource = apiData?.resource?.data;
        const attributes = resource?.attributes;

        if (!token) {
          throw new Error('Không nhận được token từ máy chủ.');
        }
        if (!attributes?.email) {
          throw new Error('Thiếu thông tin người dùng trong phản hồi.');
        }

        const normalizedUser = {
          id: String(attributes.id ?? resource?.id ?? ''),
          email: attributes.email,
          role: resource?.type ?? 'admin',
          accessToken: token,
        };

        setSession(token);

        dispatch({
          type: Types.LOGIN,
          payload: { user: normalizedUser },
        });
      } catch (err: any) {
        console.error('Login failed:', err);
        throw err;
      }
    },
    [dispatch]
  );

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      login,
      logout,
    }),
    [login, logout, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
