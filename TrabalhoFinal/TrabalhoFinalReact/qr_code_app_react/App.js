import * as React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

import { BarCodeScanner } from 'expo-barcode-scanner';
import api from './services/api';

var myUsername = "juca"
export default class LeitorQrCode extends React.Component {
  state = {
    hasCameraPermission: null,
    scanned: false,
  };

  async componentDidMount() {
    this.getPermissionsAsync();
  }

  fetch_product = async (qrCode) => {
    try{
      let response = await api.post('/enviaQRCODE', {id: myUsername, qr: qrCode});
      if (response.data.preco){
        return `Preço final do produto R$ ${response.data.preco}`
      }else{
        return response.data
      }

    }catch (error){
      console.log("ERRO " + error)
      return null
    }
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };

  render() {
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text> Requesting for camera permission </Text>;
    }
    if (hasCameraPermission === false) {
      return <Text> No access to camera </Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? '' : this.handleQrCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned ? (
          <Button
            title={'Toque para escanear novamente'}
            onPress={() =>
              this.setState({
                scanned: false,
              })
            }
          />
        ) : [] }
      </View>
    );
  }

  handleQrCodeScanned = async ({ type, data }) => {
    this.setState({
      scanned: true,
    });
    let res = await this.fetch_product(data)
    alert (res)
  };

}
