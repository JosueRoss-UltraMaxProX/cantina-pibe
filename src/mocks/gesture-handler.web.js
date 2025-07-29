// Mock para react-native-gesture-handler no web
export const GestureHandlerRootView = ({ children }) => children;
export const PanGestureHandler = ({ children }) => children;
export const TapGestureHandler = ({ children }) => children;
export const State = {};
export const gestureHandlerRootHOC = (Component) => Component;
export default {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  State,
  gestureHandlerRootHOC
};