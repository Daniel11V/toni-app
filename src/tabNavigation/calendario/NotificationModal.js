import React, { Component } from 'react';
import {
  Modal,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  StyleSheet,
  LayoutAnimation,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default class NotificationModal extends Component {
  constructor(props) {
    super(props);
    this.editableOn = this.editableOn.bind(this)
    this.editableOff = this.editableOff.bind(this)
    this.guardarPersonalizada = this.guardarPersonalizada.bind(this)
    this.state = {
      text: undefined,
      editable: false,
      newText: '',
      unidad: '',
    }
  }

  componentDidMount() {this.setState({text: this.props.text})}
  componentWillReceiveProps(newProps) {
    if (newProps.text !== this.props.text) {this.setState({text: newProps.text})}
  }

  editableOn() {
    const { text } = this.state
    LayoutAnimation.spring();
    let realNewText = parseFloat(text)
    let realUnidad;
    if (parseFloat(realNewText)< 10) {
      realUnidad = text.slice(2, -6)
    } else {
      realUnidad = text.slice(3, -6)
    }
    if (text === 'No notificar' || text === 'A la hora del evento') {
      realNewText = '10'
      realUnidad = 'minutos'
    }
    this.setState({editable:true, newText:`${realNewText}`, unidad:realUnidad})
  }

  editableOff() {
    this.setState({editable:false})
  }

  changeUnidad(unidad) {
    this.setState({unidad: unidad})
  }

  guardarPersonalizada() {
    const { newText, unidad,  } = this.state
    const newTextPerf = newText===''?'10':newText;
    const newTexto = newTextPerf + ' ' + unidad + ' antes'
    this.setState({editable:false,text:newTexto}, this.props.onCloseModal(newTexto))
  }

  render() {
    const { newText } = this.state
    const isSelected = (text) => {return text === this.state.text};
    const isSelected2 = (unidad) => {return unidad === this.state.unidad};
    const ifEditada = (text) => {
      let haySelect = 'nop'
      haySelect='No notificar'===text?'sep':haySelect
      haySelect='A la hora del evento'===text?'sep':haySelect
      haySelect='10 minutos antes'===text?'sep':haySelect
      haySelect='30 minutos antes'===text?'sep':haySelect
      if (haySelect === 'sep') {
        return false
      } else {
        return true
      }
    }

    const cajita = (text, isEditada) => {return (
      <TouchableOpacity
        style={styles.seleccionar}
        onPress={() => this.props.onCloseModal(text)}>
          <Text style={isSelected(text)?styles.textoElegido:styles.texto}>
            {text}
          </Text>
          {isSelected(text)?<Icon name="md-checkmark" size={23} color="#396BC8" />:<View></View>}
      </TouchableOpacity>
    )}

    const cajita2 = (unidad) => {
      const escribirUni = unidad.replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
      });
      return (
      <TouchableOpacity
        style={styles.seleccionar}
        onPress={() => this.changeUnidad(unidad)}>
          <Text style={[isSelected2(unidad)?styles.textoElegido:styles.texto, {paddingHorizontal: 10}]}>
            {escribirUni}{isSelected2(unidad)?' antes':''}
          </Text>
          {isSelected2(unidad)?<Icon name="md-checkmark" size={23} color="#396BC8" />:<View></View>}
      </TouchableOpacity>
    )}

    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.modalNotiVisible}
          onRequestClose={() => this.props.onCloseModal(this.state.text)}
          >
          <TouchableWithoutFeedback onPress={() => this.props.onCloseModal(this.state.text)}>
            <View style={styles.container}>
              <TouchableWithoutFeedback >
                <View style={styles.modal} >
                  {cajita('No notificar', false)}
                  {cajita('A la hora del evento', false)}
                  {cajita('10 minutos antes', false)}
                  {cajita('30 minutos antes', false)}
                  {ifEditada(this.state.text)?cajita(this.state.text, false):<View></View>}
                  <TouchableOpacity
                    style={styles.seleccionar}
                    onPress={this.editableOn}>
                      <Text style={styles.texto}>
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
                            <View style={[styles.editarTiempo, {borderBottomWidth:1,borderColor:'#ccc',paddingTop:20}]}>
                              <Text style={[styles.texto, {fontWeight: 'bold'}]}>
                                Notificación personalizada
                              </Text>
                            </View>
                            <View style={[styles.editarTiempo, {borderBottomWidth:1,borderColor:'#ccc',paddingVertical:0}]}>
                              <TextInput
                                value={newText}
                                underlineColorAndroid="transparent"
                                maxLength={2}
                                autoFocus={true}
                                keyboardType='numeric'
                                style={[styles.texto, {color: '#396BC8'}]}
                                onChangeText={(newText) => {
                                  this.setState({ newText })
                                }}
                                selectionColor="#396BC8"
                                />
                            </View>
                            {cajita2('minutos')}
                            {cajita2('horas')}
                            {cajita2('dias')}
                            {cajita2('semanas')}
                            <View style={[styles.editarTiempo, {borderBottomWidth:1,borderColor:'#ccc',paddingVertical:0}]}>
                            </View>
                            <TouchableWithoutFeedback onPress={this.guardarPersonalizada}>
                              <View style={[styles.editarTiempo, {justifyContent: 'center'}]}>
                                <Text style={[styles.texto, {flex: 0}]}>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'rgba(0,0,0,0.5)'
  },
  modal: {
    padding: 15,
    backgroundColor: '#fff',
    elevation: 4,
    width: 300,
    borderRadius: 3,
  },
  seleccionar: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingRight: 20,
    paddingLeft: 7,
  },
  texto: {
    color: '#000',
    fontSize: 17,
    flex: 1,
  },
  textoElegido: {
    color: '#396BC8',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  editarTiempo: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingRight: 20,
    paddingLeft: 15,
  },
})
