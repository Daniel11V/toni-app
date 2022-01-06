import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ListView,
  LayoutAnimation,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import NotaBox from './NotaBox';
import EditarNota from './EditarNota';
import OpcNotas from './OpcNotas';
import { firebaseDatabase } from '../../firebase'

export default class Notas extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.notaRef = firebaseDatabase.ref(`notas`);
    this.state = {
      dataSource: ds,
      notas: [],
      notas2: [],
      nota: 0,
      cargando: true,
      editorActPlus: false,
      editorAct: false,
      navAct: 'nop',
      navAnim: {keys: [], values: []},
    };
  }

  componentDidMount() {
    this.notaRef.on('child_added', this.firebaseProcessAdd)
    this.notaRef.on('child_removed', (data) => {this.firebaseProcessDelete(data)})
    this.notaRef.on('child_changed', (data) => {this.firebaseProcessChange(data)})
  }

  componentWillUnmount() {
    this.notaRef.off()
  }

  firebaseProcessAdd = (data) => {
    let nota = [];
    nota.push({
      type: data.val().type,
      title: data.val().title,
      allText: data.val().allText,
      key: data.key,
    })
    if (data.val().type === 'fijada') {
      this.setState({
        notas: this.state.notas.concat(nota),
        navAnim: {
          keys: this.state.navAnim.keys.concat(data.key),
          values: this.state.navAnim.values.concat(new Animated.Value(0))
        },
        cargando: false,
      })
    } else {
      this.setState({
        notas2: this.state.notas2.concat(nota),
        navAnim: {
          keys: this.state.navAnim.keys.concat(data.key),
          values: this.state.navAnim.values.concat(new Animated.Value(0))
        },
        cargando: false,
      })
    }
  }

  firebaseProcessChange = (data) => {
    let notas = this.state.notas
    let notas2 = this.state.notas2
    const { type, title, allText, key} = this.state.nota
    for (let i = 0; i < notas.length; i++) {
      if (notas[i].key === data.key) {
        notas[i] = {type:type,title:title,allText:allText,key:key}
        this.setState({notas: notas})
      }
    }
    for (let i = 0; i < notas2.length; i++) {
      if (notas2[i].key === data.key) {
        notas2[i] = {type:type,title:title,allText:allText,key:key}
        this.setState({notas2: notas2})
      }
    }
  }

  firebaseProcessDelete = (data) => {
    let {notas, notas2, navAnim} = this.state
    for (let i = 0; i < notas.length ; i++) {
      if (notas[i].key === data.key) {
        for (let i2 = i; i2 < notas.length - 1; i2++) {
          notas[i2] = notas[i2 + 1];
        }
        notas.length = notas.length - 1;
        this.setState({notas: notas})
      }
    }
    for (let i = 0; i < notas2.length ; i++) {
      if (notas2[i].key === data.key) {
        for (let i2 = i; i2 < notas2.length - 1; i2++) {
          notas2[i2] = notas2[i2 + 1];
        }
        notas2.length = notas2.length - 1;
        this.setState({notas2: notas2})
      }
    }
    for (let i = 0; i < navAnim.keys.length ; i++) {
      if (navAnim.keys[i] === data.key) {
        for (let i2 = i; i2 < navAnim.keys.length - 1; i2++) {
          navAnim.keys[i2] = navAnim.keys[i2 + 1];
          navAnim.values[i2] = navAnim.values[i2 + 1];
        }
        navAnim.keys.length = navAnim.keys.length - 1;
        navAnim.values.length = navAnim.values.length - 1;
        this.setState({navAnim: {keys: navAnim.keys, values: navAnim.values}})
      }
    }
  }

  crearNota = (nota) => {
    const { type, title, allText} = nota
    if (title === '' && allText === '' ) return
    let newNotaRef = this.notaRef.push();
    newNotaRef.set({
      type: type,
      title: title,
      allText: allText,
    });
  }

  editarNota(nota) {
    const { type, title, allText, key, primerType} = nota
    if (title === '' && allText === '' ) {
      this.notaRef.child(key).remove()
      return
    } else if (type === 'fijada') {
      if (primerType === 'today') {
        this.notaRef.child(key).remove()
      }
      this.notaRef.child(key).update({type:type,title:title,allText:allText});
    } else {
      if (primerType === 'fijada') {
        this.notaRef.child(key).remove()
      }
      this.notaRef.child(key).update({type:type,title:title,allText:allText});
    }
  }

  toogleOpenNav = (nota) => {
    this.setState({
      nota: nota,
      navAct: [].concat(nota.key),
    })
    let index = this.state.navAnim.keys.indexOf(nota.key)
    Animated.timing(this.state.navAnim.values[index], {
      toValue: 150,
      duration: 500
    }).start()
  }

  toogleOpenEditorPlus = () => {
    const nota = {
      type: 'today',
      title: '',
      allText: '',
      key: '',
    };
    this.setState({nota,editorActPlus: true});
  }

  toogleNotaEditor = (nota) => {
    const {navAct, navAnim} = this.state
    const indexA = navAnim.keys.indexOf(nota.key)
    const animatedColor = navAnim.values[indexA]
    const index = navAct.indexOf(nota.key)
    if (index !== -1) {
      navAct.splice(index,1)
      const navActOfficial = navAct.length === 0 ? navActOfficial = 'nop' : navActOfficial = navAct
      Animated.timing(animatedColor, {
        toValue: 0,
        duration: 750
      }).start()
      this.setState({ navAct: navActOfficial })
    } else if (navAct !== 'nop') {
      this.setState({navAct: navAct.concat(nota.key)}, Animated.timing(animatedColor, {
        toValue: 150,
        duration: 750
      }).start())
    } else {
      this.setState({
        nota: nota,
        editorAct: true,
      })
    }
  }

  closeNotaEditor = (nota) => {
    if (this.state.editorActPlus === true) {
      this.crearNota(nota)
      this.setState({editorActPlus: false})
    } else if (this.state.editorAct === true){
      this.setState({nota, editorAct: false}, () => {this.editarNota(nota)})
    } else {
      this.setState({navAct: 'nop'})
      this.state.navAnim.values.forEach(animatedColor => {
        Animated.timing(animatedColor, {
          toValue: 0,
          duration: 500,
        }).start()
      })
    }
  }

  NotasList(queNotas) {
    const interpolateColor = (animatedColor) => {
      return animatedColor.interpolate({
        inputRange: [0,150],
        outputRange: ['rgb(255,255,255)', 'rgb(119,119,119)']
      })
    }
    const interpolateFondo = (animatedColor) => {
      return animatedColor.interpolate({
        inputRange: [0,150],
        outputRange: ['#fff','#ccc']
      })
    }
    const animatedStyle = (key) => {
      let { navAnim } = this.state
      let index = navAnim.keys.indexOf(key)
      if (index === -1) {
        return {
          borderColor: 'rgb(255,255,255)',
          backgroundColor:'#fff'
        }
      } else {
        let animatedColor = navAnim.values[index]
        return {
          borderColor: interpolateColor(animatedColor),
          backgroundColor:interpolateFondo(animatedColor)
        }
      }
    };

    if (queNotas.length === 0) {return (<View></View>)}
    return (
      <ListView
        showsVerticalScrollIndicator={false}
        dataSource={this.state.dataSource.cloneWithRows(queNotas)}
        renderRow={(nota) => {
          return (
            <View>
              <NotaBox title={nota.title} type={nota.type} allText={nota.allText}
                onLongPress={() => this.toogleOpenNav(nota)}
                onPress={() => this.toogleNotaEditor(nota)}
                style={animatedStyle(nota.key)}
                />
            </View>
          )
        }}
        />
    )
  }

  render() {
    return (
      <View style={{flex:1}} >
        <View style={[styles.nav, styles.header]}>
          <Text style={styles.titleHeader}>Notas</Text>
        </View>
        <ScrollView style={styles.boxes}>
          {this.state.cargando === true ? <ActivityIndicator size='large' color='#396BC8' style={styles.space}/> : <View></View>}
          {this.state.notas.length === 0 ? <View></View> :
          <Text style={[styles.fijadaText,{marginVertical: 15}]}>Fijadas</Text>
          }
          {this.NotasList(this.state.notas)}
          {this.state.notas2.length === 0 ? <View></View> :
          <Text style={[styles.fijadaText, {marginBottom: 12, marginTop: 30}]}>Otras</Text>
          }
          {this.NotasList(this.state.notas2)}
          <View style={{height: 40}}></View>
        </ScrollView>

        <TouchableOpacity activeOpacity={1} style={styles.addButton} onPress={this.toogleOpenEditorPlus}>
          <Icon name="ios-add" size={40} color="#ffffff" />
        </TouchableOpacity>
        <EditarNota
          isActive={this.state.editorActPlus === true || this.state.editorAct === true ? true : false}
          nota={this.state.nota}
          flechaAtras={this.closeNotaEditor}
          />
        <OpcNotas
          notas={this.state.notas}
          notas2={this.state.notas2}
          navAct={this.state.navAct}
          flechaAtras={this.closeNotaEditor}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    backgroundColor: '#396BC8',
  },
  titleHeader: {
    fontSize: 25,
    color: '#fff'
  },
  boxes: {
    flex: 1,
    backgroundColor: '#eee'
  },
  addButton: {
    backgroundColor: '#396BC8',
    height: 60,
    width: 60,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    marginTop: 445,
    right:20,
    shadowColor: "#ff2900ff",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0
    },
    elevation: 32,
  },
  nav: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOpacity: .5,
    shadowOffset: {
      height: 3,
      width: -2,
    },
    elevation: 5,
  },
  fijadaText: {
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 15,
  },
  space: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
  },
});
