import React, { Component } from 'react';
import {
  Modal,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default class RepetitionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repeticion: undefined,
    }
  }

  componentDidMount() {this.setState({repeticion: this.props.repeticion})}
  componentWillReceiveProps(newProps) {
    if (newProps.repeticion !== this.props.repeticion) {this.setState({repeticion: newProps.repeticion})}
  }

  render() {
    const isSelected = (repeticion) => {return repeticion === this.state.repeticion};
    const cajita = (repeticion) => {return (
      <TouchableOpacity
        style={styles.seleccionar}
        onPress={() => this.props.onCloseModal(repeticion)}>
          <Text style={isSelected(repeticion)?styles.textoElegido:styles.texto}>
            {repeticion}
          </Text>
          {isSelected(repeticion)?<Icon name="md-checkmark" size={23} color="#396BC8" />:<View></View>}
      </TouchableOpacity>
    )}

    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.repModalVisible}
          onRequestClose={() => {console.warn("Modal has been closed.")}}
          >
          <TouchableWithoutFeedback onPress={() => this.props.onCloseModal(this.state.repeticion)}>
            <View style={styles.container}>
              <TouchableWithoutFeedback >
                <View style={styles.modal} >
                  {cajita('No se repite')}
                  {cajita('Todos los dias')}
                  {cajita('Semanalmente')}
                  {cajita('Mensualmente')}
                  {cajita('Anualmente')}
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
})
