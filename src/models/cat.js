import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAT_HEIGHT = 150;
const CAT_WIDTH = Math.round(CAT_HEIGHT * (443 / 886));

const FRAMES = [
  require('../../assets/cat_1.png'),
  require('../../assets/cat_2.png'),
  require('../../assets/cat_3.png'),
  require('../../assets/cat_4.png'),
];

const FRAMES_RIGHT = [
  require('../../assets/cat_right_1.png'),
  require('../../assets/cat_right_2.png'),
  require('../../assets/cat_right_3.png'),
  require('../../assets/cat_right_4.png'),
];

const FRAMES_UP = [
  require('../../assets/cat_up_1.png'),
  require('../../assets/cat_up_2.png'),
];

const FRAMES_DOWN = [
  require('../../assets/cat_down_1.png'),
  require('../../assets/cat_down_2.png'),
];

class Cat {
  static FRAMES = FRAMES;
  static FRAMES_RIGHT = FRAMES_RIGHT;
  static FRAMES_UP = FRAMES_UP;
  static FRAMES_DOWN = FRAMES_DOWN;
  static WIDTH = CAT_WIDTH;
  static HEIGHT = CAT_HEIGHT;
  static SCREEN_WIDTH = SCREEN_WIDTH;
  static SCREEN_HEIGHT = SCREEN_HEIGHT;
}

export default Cat;
