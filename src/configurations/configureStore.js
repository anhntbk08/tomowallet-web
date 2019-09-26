/**
 *
 * TomoWallet - Redux store configuration
 *
 */
// ===== IMPORTS ====
// Modules
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import createSagaMiddleWare from 'redux-saga';
// Utilities
import createReducer from './rootReducer';
// ==================

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;    
// ===== CONFIGURATION =====
export default history => {
  const sagaMiddleware = createSagaMiddleWare({});
  const middlewares = [
    routerMiddleware(history),
    sagaMiddleware,
    thunkMiddleware
  ];
  const enhancers = [applyMiddleware(...middlewares)];
  const store = createStore(createReducer(), undefined, composeEnhancers(...enhancers));

  store.runSaga = sagaMiddleware.run;
  store.injectedReducers = {};
  store.injectedSagas = {};

  return store;
};
// =========================
