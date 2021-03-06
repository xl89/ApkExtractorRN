import React, { Component, PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableNativeFeedback,
  NativeModules,
} from 'react-native';
import { observer } from 'mobx-react/native';
import AppPageStore from './AppPageStore';
import Constant from '../../../resource/constants';
import Color from '../../../resource/color';
import Lang from '../../../utils/Lang';

const { ApkExtractorModule } = NativeModules;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

class Item extends PureComponent {
  constructor(props){
    super(props);
  }

  render() {
    const item = this.props.item;
    return (
      <TouchableNativeFeedback
        onPress={() => {
          this.props.onPress(item.appPackageName, item.appName)
        }}
      >
        <View style={{ flexDirection: 'row', padding: 5 }}>
          <Image
            overlayColor={10}
            backfaceVisibility={'hidden'}
            style={{ width: 50, height: 50, resizeMode: 'stretch' }}
            source={{ uri:  'data:image/png;base64,' + item.appIcon}}
          />
          <View style={{ justifyContent: 'center', marginLeft: 5 }}>
            <Text>{item.appName}</Text>
            <Text>{item.appPackageName}</Text>
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  }
}

@observer
export default class AppPage extends Component {
  constructor(props){
    super(props);
    this.stateStore = new AppPageStore();
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextProps.focused;
  // }

  componentWillReceiveProps(nextProps) {
    if(nextProps.focused) {
      switch (nextProps.type) {
        case Constant.USER_APP:
          this.stateStore.getUserAppsInfo();
          break;
        case Constant.SYSTEM_APP:
          this.stateStore.getSystemAppsInfo();
          break;
        case Constant.ALL_APP:
          this.stateStore.getAllAppsInfo();
      }
    }
  }

  componentWillUnmount() {
    console.log('app page will unmount');
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          ListEmptyComponent={() => <ActivityIndicator style={{ marginTop: 200 }} color={Color.cyan} size={'large'}/>}
          data={this.stateStore.itemSource}
          renderItem={({item}) => <Item
            item={item}
            onPress={() => alert(Lang.get('appPage.dialogTitle'), `${item.appName}\n${item.appPackageName}`, [{
              text: Lang.get('appPage.dialogNegativeBtn')
            }, {
              text: Lang.get('appPage.dialogPositiveBtn'),
              onPress: async () => {
                const filePath = await this.stateStore.copyApp(item.appPackageName, item.appName, this.props.type);
                ApkExtractorModule.showSnackbar(
                  `${Lang.get('appPage.snackbarTitle')}${filePath}`,
                  Lang.get('appPage.snackbarAction'),
                  () => ApkExtractorModule.share(filePath, Lang.get('appPage.shareTitle'))
                );
              }
            }])}/>
          }
          initialNumToRender={20}
          keyExtractor={(item) => `${item.appPackageName}`}
        />
        {/*<Loading*/}
          {/*ref={(component) => {*/}
            {/*this.loader = component;*/}
          {/*}}*/}
          {/*message={'正在备份'}*/}
        {/*/>*/}
      </View>
    );
  }
}