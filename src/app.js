/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

console.ignoredYellowBox = [
  // 'Warning: Failed prop type: Invalid prop `source` supplied to `Image`',
  // 'Warning: In next release empty section headers will be rendered.',
  'Setting a timer for a long period of time, i.e. multiple minutes, is a performance and correctness issue'
]

import React, { Component } from 'react';
import {
  AppRegistry,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import TabNavigator from 'react-native-tab-navigator';
import Calendario from './tabNavigation/calendario/Calendario.js'
import Notas from './tabNavigation/notas/Notas.js'

export default class Toni extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'calendario',
    }
  }

  render() {
    return (
      <View style={{backgroundColor: '#fafafa',flex: 1}}>
        <StatusBar backgroundColor="#396BC8" barStyle="light-content" />
        <TabNavigator>
          <TabNavigator.Item
            selected={this.state.selectedTab === 'calendario'}
            renderIcon={() => <Icon name="md-calendar" size={25} color='#aaa' />}
            renderSelectedIcon={() => <Icon name="md-calendar" size={25} color='#396BC8' />}
            onPress={() => this.setState({ selectedTab: 'calendario' })}>
            <Calendario />
          </TabNavigator.Item>
          <TabNavigator.Item
            selected={this.state.selectedTab === 'notas'}
            renderIcon={() => <Icon name="ios-paper" size={25} color='#aaa' />}
            renderSelectedIcon={() => <Icon name="ios-paper" size={25} color='#396BC8' />}
            onPress={() => this.setState({ selectedTab: 'notas' })}>
            <Notas />
          </TabNavigator.Item>
          <TabNavigator.Item
            selected={this.state.selectedTab === 'next'}
            renderIcon={() => <Icon name="md-school" size={25} color='#aaa' />}
            renderSelectedIcon={() => <Icon name="md-school" size={25} color='#396BC8' />}
            onPress={() => this.setState({ selectedTab: 'next' })}>
            {<View></View>}
          </TabNavigator.Item>
        </TabNavigator>
      </View>
    )
  }
}

AppRegistry.registerComponent('Toni', () => Toni);
