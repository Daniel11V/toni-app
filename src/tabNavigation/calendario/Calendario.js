
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ListView,
  LayoutAnimation,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Calendar from './calendar/Calendar';

import Icon from 'react-native-vector-icons/Ionicons';
import TareaBox from './TareaBox';
import EditarTarea from './EditarTarea';
import OpcTareas from './OpcTareas';
import { firebaseDatabase } from '../../firebase'
import PushNotification from 'react-native-push-notification'
import moment from 'moment';

export default class Calendario extends React.Component {
  constructor(props: Props) {
    super(props);
    this.changeFecha = this.changeFecha.bind(this);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.tareaRef = firebaseDatabase.ref(`tareas`);
    this.state = {
      newFecha: undefined,
      fechaSelect: undefined,

      dataSource: ds,
      tareas: [],
      tarea: 0,
      tareasSelected: [],
      cargando: true,
      editorActPlus: false,
      editorAct: false,
      navAct: 'nop',
      navAnim: {keys: [], values: []},
    };
  }

  onSelectDate = (date) => {
    let arrayNuevo = []
    let Akeys = []
    let Avalues = []
    this.tareaRef.once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (this.repeatYcancel(childSnapshot, date) === false) return
        arrayNuevo = arrayNuevo.concat(this.newTarea(childSnapshot))
        Akeys = Akeys.concat(childSnapshot.key)
        Avalues = Avalues.concat(new Animated.Value(0))
      })
    });
    this.setState({
      tareas: arrayNuevo.sort((a, b) => {
        let minuteA = moment(a.diasSelect.inicio).get('minute')
        if (minuteA===0){minuteA='00'} else if (minuteA < 10){minuteA='0'+minuteA} else {minuteA=`${minuteA}`}
        let minuteB = moment(b.diasSelect.inicio).get('minute')
        if (minuteB===0){minuteB='00'} else if (minuteB < 10){minuteB='0'+minuteB} else {minuteB=`${minuteB}`}
        return parseFloat(`${moment(a.diasSelect.inicio).get('hour')}` + minuteA) - parseFloat(`${moment(b.diasSelect.inicio).get('hour')}` + minuteB);
      }),
      navAnim: {keys: Akeys, values: Avalues},
      cargando: false,
      fechaSelect: moment(date)
    })
  };


  changeFecha = (selectedDay) => {
    let arrayNuevo = []
    let Akeys = []
    let Avalues = []
    this.tareaRef.once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (this.repeatYcancel(childSnapshot, selectedDay) === false) return
        arrayNuevo = arrayNuevo.concat(this.newTarea(childSnapshot))
        Akeys = Akeys.concat(childSnapshot.key)
        Avalues = Avalues.concat(new Animated.Value(0))
      })
    });
    this.setState({
      newFecha: moment(selectedDay),
      tareas: arrayNuevo.sort((a, b) => {
        let minuteA = moment(a.diasSelect.inicio).get('minute')
        if (minuteA===0){minuteA='00'} else if (minuteA < 10){minuteA='0'+minuteA} else {minuteA=`${minuteA}`}
        let minuteB = moment(b.diasSelect.inicio).get('minute')
        if (minuteB===0){minuteB='00'} else if (minuteB < 10){minuteB='0'+minuteB} else {minuteB=`${minuteB}`}
        return parseFloat(`${moment(a.diasSelect.inicio).get('hour')}` + minuteA) - parseFloat(`${moment(b.diasSelect.inicio).get('hour')}` + minuteB);
      }),
      navAnim: {keys: Akeys, values: Avalues},
      cargando: false,
      fechaSelect:moment(selectedDay)
    });
  }

  newTarea = (childSnapshot) => {
    let data;
    if (typeof childSnapshot.title === 'string') {
      data = childSnapshot
    } else { data = childSnapshot.val() }
    return {
      diasSelect: {
        inicio: new Date(data.diasSelect.inicio),
        duracion: data.diasSelect.duracion,
        repeticion: data.diasSelect.repeticion,
      },
      title: data.title,
      allText: data.allText,
      noti: {
        text:data.noti.text,
        id:data.noti.id,
      },
      key: childSnapshot.key,
    }
  }

  repeatYcancel(childSnapshot, date) {
    const fecha = new Date(childSnapshot.val().diasSelect.inicio)
    if (moment(fecha).format("ll")!==moment(date).format("ll")) {
      if (childSnapshot.val().diasSelect.repeticion==='Todos los dias') {
        return true
      } else if (childSnapshot.val().diasSelect.repeticion==='Semanalmente' && moment(fecha).isoWeekday() === moment(date).isoWeekday()) {
        return true
      } else if (childSnapshot.val().diasSelect.repeticion==='Mensualmente' && moment(fecha).date() === moment(date).date()) {
        return true
      } else if (childSnapshot.val().diasSelect.repeticion==='Anualmente' && moment(fecha).dayOfYear() === moment(date).dayOfYear()) {
        return true
      } else {
        return false
      }
    }
  }

  componentDidMount() {
    this.algunaTarea()
    this.tareaRef.on('child_added', this.firebaseProcessAdd)
    this.tareaRef.on('child_removed', (data) => {this.firebaseProcessDelete(data)})
    this.tareaRef.on('child_changed', (data) => {this.firebaseProcessChange(data)})
    PushNotification.configure({
      onRegister: function(token){
        console.warn('Token:', token)
      },
      onNotification: (notification) => this.abrirTarea(notification),
      permissions: {alert: true, badge: true, sound: true},
      popInitialNotification: false,
      requestPermissions: true
    })
  }

  componentWillUnmount() {
    this.tareaRef.off()
  }

  algunaTarea = () => {
    const { fechaSelect } = this.state
    this.tareaRef.once('value', (snapshot) => {
      let hayAlgunaTarea = false
      snapshot.forEach((childSnapshot) => {
        hayAlgunaTarea = this.repeatYcancel(childSnapshot, fechaSelect) === true ? true : hayAlgunaTarea
      })
      if (hayAlgunaTarea === false) {
        this.setState({ cargando: false })
      }
    });
  }

  firebaseProcessAdd = (data) => {
    const { fechaSelect, navAnim, tareas } = this.state
    // 5 dias = 432000000 milisegundos
    const fecha = new Date(data.val().diasSelect.inicio)
    if (moment().diff(moment(fecha)) > 432000000 && data.val().diasSelect.repeticion === 'No se repite') {
      this.tareaRef.child(data.key).remove()
    }
    if (this.repeatYcancel(data, fechaSelect) === false) return
    let tareasUnorder = tareas.concat(this.newTarea(data))
    this.setState({
      tareas: tareasUnorder.sort((a, b) => {
        let minuteA = moment(a.diasSelect.inicio).get('minute')
        if (minuteA===0){minuteA='00'} else if (minuteA < 10){minuteA='0'+minuteA} else {minuteA=`${minuteA}`}
        let minuteB = moment(b.diasSelect.inicio).get('minute')
        if (minuteB===0){minuteB='00'} else if (minuteB < 10){minuteB='0'+minuteB} else {minuteB=`${minuteB}`}
        return parseFloat(`${moment(a.diasSelect.inicio).get('hour')}` + minuteA) - parseFloat(`${moment(b.diasSelect.inicio).get('hour')}` + minuteB);
      }),
      navAnim: {
        keys: navAnim.keys.concat(data.key),
        values: navAnim.values.concat(new Animated.Value(0))
      },
      cargando: false,
    })
  }

  firebaseProcessChange = (data) => {
    let tareas = this.state.tareas
    const { diasSelect, title, allText, noti, key} = this.state.tarea
    const { tarea } = this.state
    for (let i = 0; i < tareas.length; i++) {
      if (tareas[i].key === data.key) {
        const fecha = tareas[i].diasSelect.inicio
        if (moment(fecha).format("ll")!==moment(this.state.fechaSelect).format("ll")) {
          if (tareas[i].diasSelect.repeticion==='Semanalmente' && moment(fecha).isoWeekday() === moment(this.state.fechaSelect).isoWeekday()) {
          } else if (tareas[i].diasSelect.repeticion==='Mensualmente' && moment(fecha).date() === moment(this.state.fechaSelect).date()) {
          } else if (tareas[i].diasSelect.repeticion==='Anualmente' && moment(fecha).dayOfYear() === moment(this.state.fechaSelect).dayOfYear()) {
          } else {
            for (let i2 = i; i2 < tareas.length - 1; i2++) {
              tareas[i2] = tareas[i2 + 1];
            }
            tareas.length = tareas.length - 1;
            this.setState({
              tareas: tareas.sort((a, b) => {
                let minuteA = moment(a.diasSelect.inicio).get('minute')
                if (minuteA===0){minuteA='00'} else if (minuteA < 10){minuteA='0'+minuteA} else {minuteA=`${minuteA}`}
                let minuteB = moment(b.diasSelect.inicio).get('minute')
                if (minuteB===0){minuteB='00'} else if (minuteB < 10){minuteB='0'+minuteB} else {minuteB=`${minuteB}`}
                return parseFloat(`${moment(a.diasSelect.inicio).get('hour')}` + minuteA) - parseFloat(`${moment(b.diasSelect.inicio).get('hour')}` + minuteB);
              }),
            })
            return
          }
        }
        tareas[i] = this.newTarea(tarea)
        // tareas[i] = {
        //   diasSelect:{inicio:new Date(diasSelect.inicio),duracion:diasSelect.duracion,repeticion:diasSelect.repeticion},
        //   title:title,
        //   allText:allText,
        //   noti:{text:noti.text,id:noti.id},
        //   key:key
        // }
        this.setState({
          tareas: tareas.sort((a, b) => {
            let minuteA = moment(a.diasSelect.inicio).get('minute')
            if (minuteA===0){minuteA='00'} else if (minuteA < 10){minuteA='0'+minuteA} else {minuteA=`${minuteA}`}
            let minuteB = moment(b.diasSelect.inicio).get('minute')
            if (minuteB===0){minuteB='00'} else if (minuteB < 10){minuteB='0'+minuteB} else {minuteB=`${minuteB}`}
            return parseFloat(`${moment(a.diasSelect.inicio).get('hour')}` + minuteA) - parseFloat(`${moment(b.diasSelect.inicio).get('hour')}` + minuteB);
          }),
        })
      }
    }
  }

  firebaseProcessDelete = (data) => {
    let {tareas, navAnim} = this.state
    for (let i = 0; i < tareas.length ; i++) {
      if (tareas[i].key === data.key) {
        for (let i2 = i; i2 < tareas.length - 1; i2++) {
          tareas[i2] = tareas[i2 + 1];
          navAnim.keys[i2] = navAnim.keys[i2 + 1];
          navAnim.values[i2] = navAnim.values[i2 + 1];
        }
        tareas.length = tareas.length - 1;
        navAnim.keys.length = navAnim.keys.length - 1;
        navAnim.values.length = navAnim.values.length - 1;
        this.setState({tareas: tareas, navAnim: {keys: navAnim.keys, values: navAnim.values}})
      }
    }
  }



  abrirTarea(notification) {
    const key = notification.userInfo.id
    let tareas = this.state.tareas
    for (let i = 0; i < tareas.length; i++) {
      if (tareas[i].key === key) {
        this.setState({tarea: tareas[i], editorAct: true})
      }
    }
  }

  crearTarea = (tarea) => {
    const { diasSelect, title, allText, noti} = tarea
    let newTareaRef = this.tareaRef.push();
    newTareaRef.set({
      diasSelect: {inicio:diasSelect.inicio.toString(),duracion:diasSelect.duracion,repeticion:diasSelect.repeticion},
      title: title,
      allText: allText,
      noti: {text:noti.text, id:noti.id},
    });
  }

  editarTarea(tarea) {
    const { diasSelect, title, allText, noti, key} = tarea
    this.tareaRef.child(key).update({
      diasSelect:{inicio:new Date(diasSelect.inicio),duracion:diasSelect.duracion,repeticion:diasSelect.repeticion},
      title:title,
      allText:allText,
      noti: {text:noti.text, id:noti.id},
    });
  }

  toogleOpenNav = (tarea) => {
    this.setState({
      tarea: tarea,
      navAct: [].concat(tarea.key),
    })
    let index = this.state.navAnim.keys.indexOf(tarea.key)
    Animated.timing(this.state.navAnim.values[index], {
      toValue: 150,
      duration: 500
    }).start()
  }

  toogleOpenEditorPlus = () => {
    const { fechaSelect } = this.state
    LayoutAnimation.spring();
    const tarea = {
      diasSelect: {
        inicio: moment(fechaSelect).add(10, 'minutes'),
        duracion: '100',
        repeticion: 'No se repite'
      },
      title: '',
      allText: '',
      noti: {
        text: '10 minutos antes',
        id: '',
      },
      key: '',
    };
    this.setState({tarea,editorActPlus: true});
  }

  toogleTareaEditor = (tarea) => {
    const {navAct, navAnim} = this.state
    const indexA = navAnim.keys.indexOf(tarea.key)
    const animatedColor = navAnim.values[indexA]
    const index = navAct.indexOf(tarea.key)
    if (index !== -1) {
      navAct.splice(index,1)
      const navActOfficial = navAct.length === 0 ? navActOfficial = 'nop' : navActOfficial = navAct
      Animated.timing(animatedColor, {
        toValue: 0,
        duration: 650
      }).start()
      this.setState({ navAct: navActOfficial })
    } else if (navAct !== 'nop') {
      this.setState({navAct: navAct.concat(tarea.key)}, Animated.timing(animatedColor, {
        toValue: 150,
        duration: 650
      }).start())

    } else {
      LayoutAnimation.spring();
      this.setState({
        tarea: tarea,
        editorAct: true,
      })
    }
  }

  closeTareaEditor = (tarea) => {
    if (this.state.editorActPlus === true) {
      this.crearTarea(tarea)
      this.setState({editorActPlus: false})
    } else if (this.state.editorAct === true){
      this.setState({tarea, editorAct: false}, () => {this.editarTarea(tarea)})
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

  TareasList(queTareas) {
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

    return (
      <ListView
        showsVerticalScrollIndicator={false}
        enableEmptySections={true}
        dataSource={this.state.dataSource.cloneWithRows(queTareas)}
        renderRow={(tarea) => {
          return (
            <View>
              <TareaBox diasSelect={tarea.diasSelect} title={tarea.title} allText={tarea.allText} noti={tarea.noti}
                onLongPress={() => this.toogleOpenNav(tarea)}
                onPress={() => this.toogleTareaEditor(tarea)}
                style={animatedStyle(tarea.key)}
                />
            </View>
          )
        }}
        />
    )
  }

  render() {
    return (
      <View style={{flex:1}}>
        <Calendar showDaysAfterCurrent={30} onSelectDate={this.onSelectDate} style={{elevation: 4}}
          currentDate={this.state.newFecha?this.state.newFecha:''}
          llegoFecha={this.changeFecha}/>
          <ScrollView style={styles.boxes}>
            {this.state.cargando === true? <ActivityIndicator size='large' color='#396BC8' style={styles.space}/> : <View></View>}
            {this.state.tareas.length === 0 && this.state.cargando === false?
              <Text style={[styles.fijadaText,{marginVertical: 30, alignSelf: 'center', fontSize: 25}]}>No hay Tareas</Text> : <View></View>}
            {this.state.tareas.length === 0? <View></View> :
              <Text style={[styles.fijadaText,{marginVertical: 15}]}>Tareas</Text>}
            {this.TareasList(this.state.tareas)}
            <View style={{height: 40}}></View>
          </ScrollView>
          <TouchableOpacity activeOpacity={1} style={styles.addButton} onPress={this.toogleOpenEditorPlus}>
            <Icon name="ios-add" size={40} color="#ffffff" />
          </TouchableOpacity>
          <EditarTarea
            isActive={this.state.editorActPlus === true || this.state.editorAct === true ? true : false}
            tarea={this.state.tarea}
            flechaAtras={this.closeTareaEditor}
            soloCerrar={() => {this.state.editorActPlus===true?
              this.setState({editorActPlus: false}):
              this.setState({editorAct: false})}}
            />
          <OpcTareas
            tareas={this.state.tareas}
            navAct={this.state.navAct}
            flechaAtras={this.closeTareaEditor}
            />
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
