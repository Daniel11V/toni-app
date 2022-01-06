import React, { Component } from 'react';
import {
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  DatePickerAndroid,
  TimePickerAndroid,
  LayoutAnimation,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DuracionModal from './DurationModal';
import NotificationModal from './NotificationModal';
import RepetitionModal from './RepetitionModal';
import PushNotification from 'react-native-push-notification';
import moment from 'moment';
import 'moment/locale/es';
moment.locale('es');

export default class EditarTarea extends Component {
  constructor(props) {
    super(props);
    this.guardar = this.guardar.bind(this);
    this.durModalShow = this.durModalShow.bind(this);
    this.notiModalShow = this.notiModalShow.bind(this);
    this.repModalShow = this.repModalShow.bind(this);
    this.onCloseDuracion = this.onCloseDuracion.bind(this);
    this.onCloseTextNoti = this.onCloseTextNoti.bind(this);
    this.onCloseRepeticion = this.onCloseRepeticion.bind(this);
    this.state = {
      diasSelect:{inicio: moment(), duracion: '100', repeticion: 'No se repite'},
      title: '',
      allText: '',
      textNoti: {text: '10 minutos antes', id: ''},
      key: '',
      durModalVisible: false,
      notiModalVisible: false,
      repModalVisible: false,
      isActive: false,
      aparecerTop: new Animated.Value(520),
      cargando: false,
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps !== this.props) {
      if (newProps.isActive === true) {
        Animated.timing(this.state.aparecerTop, {
          toValue: -1,
          duration: 1000,
        }).start()
      } else {
        Animated.timing(this.state.aparecerTop, {
          toValue: 520,
          duration: 1000,
        }).start()
      }
      this.setState({
        diasSelect:newProps.tarea.diasSelect||{inicio: moment(), duracion: '100', repeticion: 'No se repite'},
        title: newProps.tarea.title,
        allText: newProps.tarea.allText||'',
        textNoti: newProps.tarea.noti||{text: '10 minutos antes', id: ''},
        key: newProps.tarea.key,
        isActive: newProps.isActive,
      })
    }
  }

  _numberOfLines(allText) {
    const arrayOfLines = allText.split(/\r?\n/);
    let lines = arrayOfLines.length + 1
    arrayOfLines.map((line) => {
      const linesOfOneLine = Math.floor(line.length / 35)
      lines = lines + linesOfOneLine
    })
    return lines
  }

  guardar = ()  => {
    this.setState({cargando: true})
    const {diasSelect,title,allText,textNoti,key} = this.state
    let fecha = new Date()
    if (title === '') {
      this.setState({cargando: false})
      Alert.alert(
        'No se pudo guardar',
        'A olvidado escribir el titulo',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        { cancelable: true }
      )
      return
    }
    tarea = {
      diasSelect: diasSelect,
      title: title,
      allText: allText,
      noti: {
        text: textNoti.text,
        id: Date.parse(fecha).toString().slice(0, 7),
      },
      key: key,
    }
    PushNotification.cancelLocalNotifications({id: textNoti.id})
    if (textNoti.text !== 'No notificar') {
      let notiDate;
      if (textNoti.text === 'A la hora del evento') {
        notiDate = new Date(diasSelect.inicio);
      } else {
        const num = textNoti.text.slice(0, 2)
        let unidad;
        let unidad2 = 'nada';
        if (parseFloat(num)< 10) {
          unidad = textNoti.text.slice(2, -6)
        } else {
          unidad = textNoti.text.slice(3, -6)
        }
        unidad2='minutos'===unidad?'minutes':unidad2
        unidad2='horas'===unidad?'hours':unidad2
        unidad2='dias'===unidad?'days':unidad2
        unidad2='semanas'===unidad?'weeks':unidad2
        notiDate = moment(diasSelect.inicio).subtract(parseFloat(num), unidad2).startOf('second');
      }
      let dias = 'time'
      let repeticionTime = null
      switch (diasSelect.repeticion) {
        case `No se repite`:
          dias = null;
          break
        case 'Todos los dias':
          dias = 'day';
          break
        case 'Semanalmente':
          dias = 'week';
          break
        case 'Mensualmente':
          repeticionTime = 2629750000;
          break
        case 'Anualmente':
          repeticionTime = 31557000000;
          break
      }
      if (moment().diff(moment(notiDate)) >= 0) {
        if (diasSelect.repeticion === 'Todos los dias') {
          notiDate = moment(notiDate).set({'year': moment().get('year'), 'month': moment().get('month'), 'date': moment().get('date')});
          if (moment().diff(moment(notiDate)) >= 0) {notiDate = notiDate.add(1, 'days')}
        } else if (diasSelect.repeticion === 'Semanalmente') {
          notiDate = moment(notiDate)
          while (moment().diff(moment(notiDate)) >= 0) {notiDate.add(7, 'days')}
        } else if (diasSelect.repeticion === 'Mensualmente') {
          notiDate = moment(notiDate).set({'year': moment().get('year'), 'month': moment().get('month')});
          if (moment().diff(moment(notiDate)) >= 0) {notiDate = notiDate.add(1, 'month')}
        } else if (diasSelect.repeticion === 'Anualmente') {
          notiDate = moment(notiDate).set({'year': moment().get('year')});
          if (moment().diff(moment(notiDate)) >= 0) {notiDate = notiDate.add(1, 'year')}
        } else {
          setTimeout(() => { this.setState({cargando: false}) }, 600);
          this.props.flechaAtras(tarea)
          return
        }
      }
      PushNotification.localNotificationSchedule({
        userInfo: {id: Date.parse(fecha).toString().slice(0, 7)},
        id: Date.parse(fecha).toString().slice(0, 7),
        title: title,
        message: allText,
        date: new Date(notiDate),
        subText: 'Tareas',
        largeIcon: 'ic_noti',
        smallIcon: 'ic_noti2',
        repeatType: dias,
        repeatTime: repeticionTime,
      })
    }
    setTimeout(() => { this.setState({cargando: false}) }, 600);
    this.props.flechaAtras(tarea)
  }

  selectDate = async () => {
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        date: new Date(this.state.diasSelect.inicio)
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        let selectedDay = moment(this.state.diasSelect.inicio).set({'year': year, 'month': month, 'date': day})
        let dias2 = this.state.diasSelect
        dias2.inicio = selectedDay
        this.setState({ diasSelect: dias2 })
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }

  selectTime = async () => {
    const fecha = this.state.diasSelect.inicio
    try {
      const {action, hour, minute} = await TimePickerAndroid.open({
        hour: moment(fecha).get('hour'),
        minute: moment(fecha).get('minute'),
        is24Hour: true, // Will display '2 PM'
      });
      if (action !== TimePickerAndroid.dismissedAction) {
        const selectedDay = moment(fecha).set({'hour': hour, 'minute': minute})
        let dias2 = this.state.diasSelect
        dias2.inicio = selectedDay
        this.setState({ diasSelect: dias2 })
      }
    } catch ({code, message}) {
      console.warn('Cannot open time picker', message);
    }
  }

  durModalShow(){
    LayoutAnimation.spring();
    this.setState({durModalVisible: true})
  }

  notiModalShow(){
    LayoutAnimation.spring();
    this.setState({notiModalVisible: true})
  }

  repModalShow(){
    LayoutAnimation.spring();
    this.setState({repModalVisible: true})
  }

  onCloseDuracion(duracion) {
    let diasSelect = this.state.diasSelect
    diasSelect.duracion = duracion || diasSelect.duracion
    this.setState({ diasSelect, durModalVisible: false })
  }

  onCloseTextNoti(text) {
    let textNoti = this.state.textNoti
    textNoti.text = text
    this.setState({ textNoti, notiModalVisible: false })
  }

  onCloseRepeticion(repeticion) {
    let diasSelect = this.state.diasSelect
    diasSelect.repeticion = repeticion
    this.setState({ diasSelect, repModalVisible: false })
  }

  render() {
    const { diasSelect, title, allText, textNoti } = this.state
    const changeDuracionString = duracion => {
      let hour = duracion.slice(0,1);
      let stringHour = hour + ' h';
      let min = duracion.slice(1,3);
      let stringMin = min + ' min';
      let stringDuracion = stringHour + ', ' + stringMin
      if (hour === '0') {
        stringDuracion = min + ' minutos'
      } else if (hour==='1' && min==='00') {
        stringDuracion = '1 hora'
      } else if (min==='00') {
        stringDuracion = hour + ' horas'
      }
      return stringDuracion
    }
    return (
      <Animated.View style={[styles.añadirTarea, {top: this.state.aparecerTop}]} >
        <View style={styles.nav}>
          <TouchableOpacity onPress={this.props.soloCerrar} style={styles.boxIcon}>
            <Icon name="md-arrow-back" size={25} color="#999aac" />
          </TouchableOpacity>
          <View style={{flexDirection: 'row'}}>
            {this.state.cargando === true?
              <ActivityIndicator size={30} color="#396BC8" style={styles.boxIcon}/> :
              <TouchableOpacity style={styles.boxIcon} onPress={this.guardar}>
                <Icon name="ios-checkmark-circle" size={35} color="#396BC8" />
              </TouchableOpacity>
            }
          </View>
        </View>
        <ScrollView >
          <View style={{flexDirection: 'row'}}>
            <Text style={[styles.titulo, {paddingBottom:10, paddingTop:30}]}>TITULO</Text>
            <TextInput
              value={title}
              placeholder="Escribir el titulo aquí..."
              underlineColorAndroid="#396BC8"
              maxLength={25}
              style={{flex:1, textAlignVertical: 'bottom',fontSize:17, marginHorizontal: 20}}
              onChangeText={(title) => {
                this.setState({ title })
              }}
              autoCapitalize="sentences"
              selectionColor="#396BC8"
              />
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.titulo}>FECHA</Text>
            <View>
              <TouchableOpacity onPress={this.selectDate}>
                <Text style={[styles.titulo, {fontWeight: 'normal'}]} >
                  {moment(diasSelect.inicio).format("dddd[,] DD [de] MMMM")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.titulo}>HORA</Text>
            <TouchableOpacity onPress={this.selectTime}>
              <Text style={[styles.titulo, {fontWeight: 'normal', paddingHorizontal: 40,}]} >
                {moment(diasSelect.inicio).format("HH:mm")}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{flexDirection: 'row', justifyContent: 'space-between'}}
            onPress={this.durModalShow}>
            <Text style={styles.titulo}>DURACION</Text>
            <Text style={[styles.titulo, {fontWeight: 'normal',  paddingLeft:0}]} >
              {changeDuracionString(diasSelect.duracion)}
            </Text>
          </TouchableOpacity>
          <DuracionModal
            durModalVisible={this.state.durModalVisible}
            onCloseModal={this.onCloseDuracion}
            duracion={diasSelect.duracion} />
          <TouchableOpacity
            onPress={this.repModalShow}
            style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.titulo}>REPETICION</Text>
            <Text style={[styles.titulo, {fontWeight: 'normal', paddingLeft:0}]} >
              {diasSelect.repeticion}
            </Text>
          </TouchableOpacity>
          <RepetitionModal
            repModalVisible={this.state.repModalVisible}
            onCloseModal={this.onCloseRepeticion}
            repeticion={diasSelect.repeticion} />
          <TouchableOpacity
            onPress={this.notiModalShow}
            style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.titulo}>NOTIFICACION</Text>
            <Text style={[styles.titulo, {fontWeight: 'normal', paddingLeft:0}]} >
              {textNoti.text}
            </Text>
          </TouchableOpacity>
          <NotificationModal
            modalNotiVisible={this.state.notiModalVisible}
            onCloseModal={this.onCloseTextNoti}
            text={textNoti.text} />
          <Text style={[styles.titulo, {paddingBottom: 0}]}>NOTA</Text>
          <TextInput
            numberOfLines={this._numberOfLines(allText)}
            placeholder="Alguna nota"
            placeholderTextColor="#777777"
            underlineColorAndroid="transparent"
            multiline={true}
            style={styles.texto}
            onChangeText={(allText) => {
              this.setState({allText})
            }}
            value={allText}
            autoCapitalize="sentences"
            selectionColor="#396BC8"
            />
        </ScrollView>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  añadirTarea: {
    zIndex: 5,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    flex: 1,
    elevation: 33,
  },
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
  titulo: {
    color:'#444',
    fontSize: 17,
    fontWeight: 'bold',
    textAlignVertical: 'top',
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  texto: {
    fontSize: 17,
    color: '#000',
    marginHorizontal: 25,
    textAlignVertical: 'top',
    marginLeft: 23,
  },
})
