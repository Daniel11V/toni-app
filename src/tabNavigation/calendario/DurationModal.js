import React, { Component } from 'react';
import {
  Modal,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  LayoutAnimation,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default class DuracionModal extends Component {
  constructor(props) {
    super(props);
    this.editableOn = this.editableOn.bind(this)
    this.editableOff = this.editableOff.bind(this)
    this.guardarPersonalizada = this.guardarPersonalizada.bind(this)
    this.state = {
      duracion: undefined,
      editable: false,
      newHour: '',
      newMin: '',
    }
  }

  componentDidMount() {this.setState({duracion: this.props.duracion})}
  componentWillReceiveProps(newProps) {
    if (newProps.duracion !== this.props.duracion) {this.setState({duracion: newProps.duracion})}
  }

  changeDuracionString(duracion) {
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

  editableOn() {
    const { duracion } = this.state
    LayoutAnimation.spring();
    let realNewHour = duracion.slice(0,1);
    let realNewMin = duracion.slice(1,3);
    this.setState({editable:true, newHour:realNewHour, newMin:realNewMin})
  }

  editableOff() {
    this.setState({editable:false})
  }

  changeUnidad(newMin) {
    this.setState({newMin: newMin})
  }

  guardarPersonalizada() {
    const { newHour, newMin } = this.state
    let newRealHour = newHour
    let newRealMin = newMin
    if (newHour === '') {newRealHour = '0'}
    if (newMin > 59) {
      newRealHour = `${parseFloat(newHour) + 1}`
      newRealMin = `${parseFloat(newRealMin) - 60}`
    } else if (newMin === '' || newMin === '00') {
      newRealMin = '00'
    } else if (newMin < 10) {
      newRealMin = '0' + newMin
    }
    const newDuracion = newRealHour + newRealMin
    this.setState({editable:false,duracion:newDuracion}, this.props.onCloseModal(newDuracion))
  }

  render() {
    const { newHour, newMin } = this.state
    const isSelected = (duracion) => {return duracion === this.state.duracion};
    const ifEditada = (duracion) => {
      let haySelect = 'nop'
      haySelect=undefined===duracion?'sep':haySelect
      haySelect='030'===duracion?'sep':haySelect
      haySelect='100'===duracion?'sep':haySelect
      haySelect='130'===duracion?'sep':haySelect
      haySelect='200'===duracion?'sep':haySelect
      if (haySelect === 'sep') {
        return false
      } else {
        return true
      }
    }

    const cajita = (duracion, isEditada) => {return (
      <TouchableOpacity
        style={styles.seleccionar}
        onPress={() => this.props.onCloseModal(duracion)}>
          <Text style={isSelected(duracion)?styles.duracionElegida:styles.duracion}>
            {this.changeDuracionString(duracion)}
          </Text>
          {isSelected(duracion)?<Icon name="md-checkmark" size={23} color="#396BC8" />:<View></View>}
      </TouchableOpacity>
    )}

    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.durModalVisible}
          onRequestClose={() => this.props.onCloseModal(this.state.duracion)}
          >
          <TouchableWithoutFeedback onPress={() => this.props.onCloseModal(this.state.duracion)}>
            <View style={styles.container}>
              <TouchableWithoutFeedback >
                <View style={styles.modal} >
                  {cajita('030', false)}
                  {cajita('100', false)}
                  {cajita('130', false)}
                  {cajita('200', false)}
                  {ifEditada(this.state.duracion)?cajita(this.state.duracion, false):<View></View>}
                  <TouchableOpacity
                    style={styles.seleccionar}
                    onPress={this.editableOn}>
                      <Text style={styles.duracion}>
                        Personalizar...
                      </Text>
                  </TouchableOpacity>
                  <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.editable}
                    onRequestClose={this.editableOff}
                    >

                    <TouchableWithoutFeedback onPress={this.editableOff}>
                      <View style={styles.container}>
                        <TouchableWithoutFeedback>
                          <View style={[styles.modal, {padding:0}]} >
                            <View style={styles.editarTiempo}>
                              <Text style={[styles.duracion, {fontWeight: 'bold',paddingVertical:0}]}>
                                Editar duracion:
                              </Text>
                            </View>
                            <View style={[styles.editarTiempo, {borderBottomWidth:1,borderColor:'#ccc',paddingVertical:0}]}>
                              <TextInput
                                value={newHour}
                                underlineColorAndroid="#396BC8"
                                maxLength={1}
                                autoFocus={true}
                                keyboardType='numeric'
                                style={[styles.duracion, {color: '#396BC8', flex:0, width: 18}]}
                                onChangeText={(newHour) => {
                                  this.setState({ newHour })
                                }}
                                selectionColor="#396BC8"
                                />
                              <Text style={[styles.duracion, {paddingTop:13, flex: 0}]}>
                                {newHour==='1'||newHour===''?'  hora,  ':'  horas,  '}
                              </Text>
                              <TextInput
                                value={newMin}
                                underlineColorAndroid="#396BC8"
                                maxLength={2}
                                keyboardType='numeric'
                                style={[styles.duracion, {color: '#396BC8', flex:0, width: 28}]}
                                onChangeText={(newMin) => {
                                  this.setState({ newMin })
                                }}
                                selectionColor="#396BC8"
                                />
                                <Text style={[styles.duracion, {paddingTop:13, flex: 0}]}>
                                  {'  minutos'}
                                </Text>
                            </View>
                            <TouchableWithoutFeedback onPress={this.guardarPersonalizada}>
                              <View style={[styles.editarTiempo, {justifyContent: 'center'}]}>
                                <Text style={[styles.duracion, {flex: 0}]}>
                                  Listo
                                </Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    </TouchableWithoutFeedback>

                  </Modal>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback >
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'rgba(0,0,0,0.5)'
  },
  modal: {
    padding: 15,
    backgroundColor: '#fff',
    elevation: 4,
    width: 230,
    borderRadius: 3,
  },
  seleccionar: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingRight: 20,
    paddingLeft: 7,
  },
  duracion: {
    color: '#000',
    fontSize: 17,
    flex: 1,
  },
  duracionElegida: {
    color: '#396BC8',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  editarTiempo: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15
  },
})
