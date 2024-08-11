import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Image, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

interface UserData {
  fname: string;
  lname: string;
  mobile: string;
  aadhar: string;
  locationOfStall: string;
  dob: string;
  medicalValidityDateFrom: string;
  medicalValidityDateTo: string;
  startDate: string;
  endDate: string;
  aadharCardImg: string;
  madicalValidityDocument: string;
  policeVarificationDocument: string;
  profilePic: string;
}

interface DisplayDataPageProps {
  navigation: any;  // Adjust based on your navigation prop type if using React Navigation
}

const DisplayDataPage: React.FC<DisplayDataPageProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userNotFound, setUserNotFound] = useState<boolean>(false);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [manualQRCode, setManualQRCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const fetchUserData = async (qrcode: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://railway-qbx4.onrender.com/vendor/fetchVendorDataByQR', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrcode }),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.message === 'User not found') {
        setUserNotFound(true);
        setUserData(null);
      } else {
        setUserNotFound(false);
        console.log('User Data:', result.user);
        setUserData(result.user);
        setManualQRCode('');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: BarCodeScannerResult) => {
    setScannedData(data);
    setCameraVisible(false);
    fetchUserData(data);
  };

  const handleCameraOpen = () => {
    if (hasPermission) {
      setCameraVisible(true);
    } else {
      Alert.alert('No access to camera');
    }
  };

  const handleCameraClose = () => {
    setCameraVisible(false);
    setScannedData(null);
  };

  const handleManualSubmit = () => {
    fetchUserData(manualQRCode);
  };

  const handleClearQRCode = () => {
    console.log("Clear button pressed");
    setManualQRCode('');
    setUserData(null);
    setUserNotFound(false);
  };

  const handleOpenPDF = (pdfUrl: string) => {
    Linking.openURL(pdfUrl);
  };

  return (
    <View style={styles.container}>
      {userData == null && !loading && (
        <View style={{ marginBottom: 20, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Button title="Scan QR Code" onPress={handleCameraOpen} />
        </View>
      )}

      {cameraVisible && (
        <>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <Button title="Close Camera" onPress={handleCameraClose} />
        </>
      )}

      {!cameraVisible && (
        <>
          <View style={styles.inputContainer}>
            {userData == null && (
              <TextInput
                style={styles.input}
                placeholder="Enter QR code"
                value={manualQRCode}
                onChangeText={(text) => {
                  setManualQRCode(text);
                  setUserNotFound(false);
                }}
              />
            )}
            {userData !== null && (
              <TouchableOpacity onPress={handleClearQRCode} style={styles.clearIcon}>
                <Ionicons name="close-circle" size={34} color="red" />
              </TouchableOpacity>
            )}
          
            {userData !== null && (
              <View style={{ marginTop: 20, display: 'none' }}>
                <Button title="close" onPress={() => {
                  setManualQRCode('');
                  setUserData(null);
                  setUserNotFound(false);
                }} />
              </View>
            )}
          </View>
          {userNotFound && <Text style={styles.errorText}>User not found</Text>}
          {userData == null && !loading && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ marginTop: 20 }}>
                <Button title="Submit" onPress={handleManualSubmit} />
              </View>
            </View>
          )}
        </>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        userData && (
          <ScrollView style={{marginTop:-40}}>
            <Text><Text style={styles.bold}>First Name {" "}:{" "}</Text> <Text>{userData.fname}</Text></Text>
            <Text><Text style={styles.bold}>Last Name{" "}:</Text> {userData.lname}</Text>
            <Text><Text style={styles.bold}>Mobile{" "}:</Text> {userData.mobile}</Text>
            <Text><Text style={styles.bold}>Aadhar Number{" "}:</Text> {userData.aadhar}</Text>
            <Text><Text style={styles.bold}>Location of Stall{" "}:</Text> {userData.locationOfStall}</Text>
            <Text><Text style={styles.bold}>Date of Birth{" "}:</Text> {(userData.dob).slice(0,10)}</Text>
            <Text><Text style={styles.bold}>Medical Validity From{ " "}:</Text> {(userData.medicalValidityDateFrom).slice(0,10)}</Text>
            <Text><Text style={styles.bold}>Medical Validity To{" "}:</Text> {(userData.medicalValidityDateTo).slice(0,10)}</Text>
            <Text><Text style={styles.bold}>Start Date{" "}:</Text> {(userData.startDate).slice(0,10)}</Text>
            <Text><Text style={styles.bold}>End Date{" "}:</Text> {(userData.endDate).slice(0,10)}</Text>

            <Text><Text style={styles.bold}>Aadhar Card:</Text></Text>
            {userData.aadharCardImg.endsWith('.pdf') ? (
              <>
                <Image
                  source={{ uri: 'https://img.freepik.com/premium-vector/pdf-icon-flat-pdf-vector-icon-flat-design-vector-icon_874723-147.jpg?ga=GA1.1.568218271.1720937116&semt=ais_hybrid' }}
                  style={styles.pdfIcon}
                />
                <TouchableOpacity onPress={() => handleOpenPDF(userData.aadharCardImg)}>
                  <Text style={styles.downloadButton}>Download Aadhar Card</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Image source={{ uri: userData.aadharCardImg }} style={styles.image} />
            )}

            <Text><Text style={styles.bold}>Medical Validity Document:</Text></Text>
            {userData.madicalValidityDocument.endsWith('.pdf') ? (
              <>
                <Image
                  source={{ uri: 'https://img.freepik.com/premium-vector/pdf-icon-flat-pdf-vector-icon-flat-design-vector-icon_874723-147.jpg?ga=GA1.1.568218271.1720937116&semt=ais_hybrid' }}
                  style={styles.pdfIcon}
                />
                <TouchableOpacity onPress={() => handleOpenPDF(userData.madicalValidityDocument)}>
                  <Text style={styles.downloadButton}>Download Medical Validity Document</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Image source={{ uri: userData.madicalValidityDocument }} style={styles.image} />
            )}

            <Text><Text style={styles.bold}>Police Verification Document:</Text></Text>
            {userData.policeVarificationDocument.endsWith('.pdf') ? (
              <>
                <Image
                  source={{ uri: 'https://img.freepik.com/premium-vector/pdf-icon-flat-pdf-vector-icon-flat-design-vector-icon_874723-147.jpg?ga=GA1.1.568218271.1720937116&semt=ais_hybrid' }}
                  style={styles.pdfIcon}
                />
                <TouchableOpacity onPress={() => handleOpenPDF(userData.policeVarificationDocument)}>
                  <Text style={styles.downloadButton}>Download Police Verification Document</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Image source={{ uri: userData.policeVarificationDocument }} style={styles.image} />
            )}

            <Text><Text style={styles.bold}>Profile Pic:</Text></Text>
            <Image source={{ uri: userData.profilePic }} style={styles.profilePic} />
          </ScrollView>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderColor:'red',

  },
  inputContainer: {
    marginBottom: 20,
    marginTop:60,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  clearIcon: {
    position: 'absolute',
    right: 0,
    top: -60,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },

  bold: {
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
  pdfIcon: {
    width: 50,
    height: 50,
  },
  downloadButton: {
    color: 'blue',
    marginVertical: 10,
    textAlign: 'center',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
  },
});

export default DisplayDataPage;
