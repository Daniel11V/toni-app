
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseDatabase } from '../../firebase';

export default class NotaBox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      apagado: 'off'
    }
  }

  onLayout = event => {
    let {height} = event.nativeEvent.layout
    if (height === 127) {
      this.setState({
        apagado: 'on'
      })
    } else {
      this.setState({
        apagado: 'off'
      })
    }
  }

  render() {
    const { type, title, allText, style } = this.props
    return (
      <View>
        <TouchableOpacity onLongPress={this.props.onLongPress} onPress={this.props.onPress}>
          <Animated.View style={[styles.box, style]}>
            { title ?
              <View style={styles.arriba}>
                <Text style={styles.titulo}>{title}</Text>
              </View> : <View></View>
            }
            <View onLayout={this.onLayout}>
              <Text style={[styles.texto, {maxHeight: 127}]}>{allText}</Text>
            </View>
            {this.state.apagado === 'on' ?
              <View style={{height: 20}}>
                <Text style={styles.suspensivos}>. . .</Text>
              </View> : <View style={{height: 20}}></View>}
          </Animated.View>
        </TouchableOpacity >
      </View>
    )
  }
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 2,
    borderWidth: 2.5,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 7,
    padding: 7,
    paddingBottom: 0,

    shadowColor: 'black',
    shadowOpacity: .5,
    shadowOffset: {
      height: 3,
      width: -2,
    },
    elevation: 1,
  },
  arriba: {
    flexDirection: 'row',
  },
  titulo: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  texto: {
    fontSize: 15,
  },
  suspensivos: {
    fontSize: 30,
    position: 'absolute',
    bottom: 0,
  },
  alarm: {
    flexDirection:'row',
    backgroundColor:'#ededed',
    padding: 3,
    paddingHorizontal: 5,
    borderRadius: 3,
    marginBottom: 5
  },
  alarmFont: {
    alignSelf: 'center',
    color:'#555',
    fontSize: 12,
    paddingLeft: 5
  },
});
