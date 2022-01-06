/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseDatabase } from '../../firebase';
import moment from 'moment';

export default class TareaBox extends Component {
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
    const { diasSelect, title, allText, style, noti } = this.props
    const meses = new Array ("ene.","feb.","mar.","abr.","may.","jun.","jul.","ago.","sept.","oct.","nov.", "dic.");

    const addDur = (fecha) => {
      const duracion = moment(diasSelect.duracion, "hmm")
      const horas = duracion.get('hour');
      const minutos = duracion.get('minute');
      return moment(fecha).add({hours: horas, minutes: minutos})
    }

    return (
      <View>
        <TouchableWithoutFeedback onLongPress={this.props.onLongPress} onPress={this.props.onPress}>
          <Animated.View style={[styles.box, style]}>
            <View style={styles.arriba}>
              <Text style={[styles.texto, {fontSize: 20}]}>
                {moment(diasSelect.inicio).format("HH:mm")}
                {' - '}
                {addDur(diasSelect.inicio).format("HH:mm")}
              </Text>
            </View>
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
            <View style={{flexDirection:'row'}}>
              {noti.text === 'No notificar' ? <View></View> :
                <View style={{flexDirection:'row'}}>
                  <View style={styles.alarm}>
                    <Icon name="md-time" size={18} color='#888' />
                    <Text style={styles.alarmFont}>
                      {noti.text}
                    </Text>
                  </View>
                  <View style={{flex: 1}}></View>
                </View>}
                {diasSelect.repeticion === 'No se repite' ? <View></View> :
                  <View style={{flexDirection:'row'}}>
                    <View style={styles.alarm}>
                      <Icon name="md-refresh" size={18} color='#888' />
                      <Text style={styles.alarmFont}>
                        {diasSelect.repeticion}
                      </Text>
                    </View>
                    <View style={{flex: 1}}></View>
                  </View>}
            </View>
          </Animated.View>
        </TouchableWithoutFeedback >
      </View>
    )
  }
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 2,
    borderWidth: 2.5,
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
    marginRight: 10,
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
