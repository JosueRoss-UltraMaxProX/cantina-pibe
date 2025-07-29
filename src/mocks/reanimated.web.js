// Mock para react-native-reanimated no web
export default {
  createAnimatedComponent: (Component) => Component,
  Value: class Value {
    constructor(value) {
      this.value = value;
    }
  },
  event: () => () => {},
  add: () => {},
  eq: () => {},
  set: () => {},
  cond: () => {},
  interpolate: () => {},
  Extrapolate: {},
  useSharedValue: (initialValue) => ({ value: initialValue }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: (value) => value,
  withSpring: (value) => value,
  withSequence: (...args) => args[0],
  withDelay: (delay, value) => value,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
};