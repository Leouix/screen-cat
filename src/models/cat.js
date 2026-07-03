import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAT_HEIGHT = 150;
const CAT_WIDTH = Math.round(CAT_HEIGHT * (443 / 886));

const FRAMES = [
  require('../../assets/cat_1.png'),
  require('../../assets/cat_2.png'),
  require('../../assets/cat_3.png'),
  require('../../assets/cat_4.png'),
];

class Cat {
  static FRAMES = FRAMES;
  static WIDTH = CAT_WIDTH;
  static HEIGHT = CAT_HEIGHT;
  static SCREEN_WIDTH = SCREEN_WIDTH;
}

export default Cat;
