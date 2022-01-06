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

export default class OpcNotas extends Component {
  constructor(props) {
    super(props);
    this.notaRef = firebaseDatabase.ref(`notas`);
    this.animatedOpacity = new Animated.Value(0);
    this.animatedZIndex = new Animated.Value(0);
    this.state = {
      navAct: this.props.navAct,
      notas: undefined,
      title: undefined,
      type: undefined,
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.notas !== this.state.notas || newProps.notas2 !== this.state.notas2 || newProps.navAct !== this.state.navAct) {
      const encontrarNota = (nota) => {return newProps.navAct.indexOf(nota.key) >= 0}
      const opcTareas = newProps.notas.filter(encontrarNota).concat(newProps.notas2.filter(encontrarNota))
      let allTitles = []
      let allTypes = []
      opcTareas.map(nota => {allTitles = allTitles.concat(nota.title)})
      opcTareas.map(nota => {allTypes = allTypes.concat(nota.type)})
      this.setState({
        navAct: newProps.navAct,
        notas: opcTareas,
        title: allTitles,
        type: allTypes
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

  alertDelete(titles, navAct) {
    let allTitles = []
    titles.map(title => {allTitles = allTitles.concat(`${title}`)})
    Alert.alert(
      'Eliminar Nota?',
      allTitles.join(', '),
      [
        {text: 'Cancelar'},
        {text: 'Eliminar', onPress: () => {
          this.props.flechaAtras()
          navAct.forEach(key => this.notaRef.child(key).remove())
        }},
      ],
      { cancelable: true }
    )
  }

  toogleNavFijar(nota) {
    this.notaRef.child(nota.key).remove()
    if (nota.type === 'fijada') {
      let edit_nota = {
        type: 'today',
        title: nota.title,
        allText: nota.allText,
      }
      this.notaRef.child(nota.key).update(edit_nota);
    } else {
      let edit_nota = {
        type: 'fijada',
        title: nota.title,
        allText: nota.allText,
      }
      this.notaRef.child(nota.key).update(edit_nota);
    }
    this.props.flechaAtras()
  }

  render() {
    const { type, title, navAct, notas } = this.state
    const opacity = { opacity: this.animatedOpacity }
    const zIndex = { zIndex: this.animatedZIndex }
    const pricetags = () => {
      if (navAct.length === 1) {
        const color = type.indexOf('fijada') !== -1 ? "#396BC8" : "#999aac";
        return (
          <TouchableOpacity style={styles.boxIcon} onPress={() => this.toogleNavFijar(notas[0])}>
            <Icon style={{paddingRight: 10}} name="md-pricetags" size={25} color={color} />
          </TouchableOpacity>
        )
      } else { return (<View></View>) }
    }

    return (
      <Animated.View style={[styles.nav, styles.tabbar, opacity, zIndex]}>
        <TouchableOpacity onPress={this.props.flechaAtras} style={styles.boxIcon}>
          <Icon name="md-arrow-back" size={25} color="#999aac" />
        </TouchableOpacity>
        <View style={{flexDirection: 'row'}}>
          {pricetags()}
          <TouchableOpacity style={styles.boxIcon} onPress={() => this.alertDelete(title, navAct)}>
            <Icon name="md-trash" size={25} color="#999aac" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: '#fff',
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
