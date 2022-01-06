import React, { Component } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseDatabase } from '../../firebase'
import PushNotification from 'react-native-push-notification'

export default class OpcTareas extends Component {
  constructor(props) {
    super(props);
    this.tareaRef = firebaseDatabase.ref(`tareas`);
    this.animatedOpacity = new Animated.Value(0);
    this.animatedZIndex = new Animated.Value(0);
    this.state = {
      navAct: this.props.navAct,
      tareas: undefined,
      noti: undefined,
      title: undefined,
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.tareas !== this.state.tareas || newProps.navAct !== this.state.navAct) {
      const opcTareas = newProps.tareas.filter(tarea => newProps.navAct.indexOf(tarea.key)>=0)
      let allNotis = []
      let allTitles = []
      opcTareas.map(tarea => {allNotis = allNotis.concat(tarea.noti)})
      opcTareas.map(tarea => {allTitles = allTitles.concat(tarea.title)})
      this.setState({
        navAct: newProps.navAct,
        tareas: opcTareas,
        noti: allNotis,
        title: allTitles,
      })
      if (newProps.navAct !== 'nop') {
        Animated.sequence([
          Animated.timing(this.animatedZIndex, {
            toValue: 2,
            duration: 1,
          }),
          Animated.timing(this.animatedOpacity, {
            toValue: 1,
            duration:200,
          })
        ]).start();
      } else {
        Animated.sequence([
          Animated.timing(this.animatedOpacity, {
            toValue: 0,
            duration: 400,
          }),
          Animated.timing(this.animatedZIndex, {
            toValue: 0,
            duration: 1,
          })
        ]).start()
      }
    }
  }

  alertDelete(titles, navAct, notis) {
    let allTitles = []
    titles.map(title => {allTitles = allTitles.concat(`${title}`)})
    Alert.alert(
      'Eliminar Tarea?',
      allTitles.join(', '),
      [
        {text: 'Cancelar'},
        {text: 'Eliminar', onPress: () => {
          this.props.flechaAtras()
          navAct.forEach(key => this.tareaRef.child(key).remove())
          notis.map(noti => {
            if (noti.text !== 'No notificar') {
              PushNotification.cancelLocalNotifications({id: noti.id})
            }
          })
        }},
      ],
      { cancelable: true }
    )
  }

  render() {
    const { title, navAct, noti } = this.state
    const opacity = { opacity: this.animatedOpacity }
    const zIndex = { zIndex: this.animatedZIndex }
    return (
      <Animated.View style={[styles.nav, styles.tabbar, opacity, zIndex]}>
        <TouchableOpacity onPress={this.props.flechaAtras} style={styles.boxIcon}>
          <Icon name="md-arrow-back" size={25} color='#ddd' />
        </TouchableOpacity>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={styles.boxIcon} onPress={() => this.alertDelete(title, navAct, noti)}>
            <Icon name="md-trash" size={25} color='#ddd' />
          </TouchableOpacity>
        </View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: '#396BC8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {
      height: 3,
      width: -2,
    },
    elevation: 5,
  },
  boxIcon: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
})
