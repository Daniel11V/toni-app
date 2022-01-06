import React, { Component } from 'react';
import {
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  LayoutAnimation,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default class EditarNota extends Component {
  constructor(props) {
    super(props);
    this.guardar = this.guardar.bind(this);
    this.state = {
      primerType: 'today',
      type: 'today',
      title: '',
      allText: '',
      key: '',
      isActive: false,
      aparecerTop: new Animated.Value(520),
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
        primerType: newProps.nota.type||'today',
        type: newProps.nota.type||'today',
        title: newProps.nota.title||'',
        allText: newProps.nota.allText||'',
        key: newProps.nota.key||'',
        isActive: newProps.isActive,
      })
    }
  }

  _numberOfLines(allText) {
    const arrayOfLines = allText.split(/\r?\n/);
    let lines = arrayOfLines.length + 2
    arrayOfLines.map((line) => {
      const linesOfOneLine = Math.floor(line.length / 35)
      lines = lines + linesOfOneLine
    })
    return lines
  }

  toogleFijar(type) {
    if (type === 'fijada') {
      this.setState({type: 'today'})
    } else {
      this.setState({type: 'fijada'})
    }
  }

  guardar() {
    const {type,title,allText,key,primerType} = this.state
    nota = {
      primerType: primerType,
      type: type,
      title: title,
      allText: allText,
      key: key,
    }
    this.props.flechaAtras(nota)
  }

  render() {
    const { type, title, allText} = this.state
    return (
      <Animated.View style={[styles.añadirNota, {top: this.state.aparecerTop}]}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={this.guardar} style={styles.boxIcon}>
            <Icon name="md-arrow-back" size={25} color="#999aac" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.boxIcon} onPress={() => this.toogleFijar(type)}>
            {type === 'fijada' ?
              <Icon style={{paddingRight: 10}} name="md-pricetags" size={25} color="#396BC8" /> :
              <Icon style={{paddingRight: 10}} name="md-pricetags" size={25} color="#999aac" />
            }
          </TouchableOpacity>
        </View>
        <ScrollView style={{paddingTop: 18}} keyboardDismissMode='interactive'>
          <TextInput
            value={title}
            placeholder="Titulo"
            placeholderTextColor="#777777"
            underlineColorAndroid="transparent"
            numberOfLines={1}
            maxLength={27}
            style={styles.titulo}
            onChangeText={(title) => {
              this.setState({ title })
            }}
            autoCapitalize="sentences"
            selectionColor="#396BC8"
            />
          <TextInput
            numberOfLines={this._numberOfLines(allText)}
            placeholder="Nota"
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
  añadirNota: {
    zIndex: 5,
    backgroundColor: '#fff',
    position: 'absolute',
    top: -1,
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
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    textAlignVertical: 'top',
    paddingHorizontal: 25,
  },
  texto: {
    fontSize: 17,
    color: '#000',
    flex: 1,
    paddingHorizontal: 25,
    textAlignVertical: 'top',
  },
  alarm: {
    flexDirection:'row',
    backgroundColor:'#ededed',
    padding: 5,
    marginLeft: 25,
    borderRadius: 3,
    marginBottom: 5
  },
  alarmFont: {
    color:'#555',
    fontSize: 14,
    paddingLeft: 5
  },
})
