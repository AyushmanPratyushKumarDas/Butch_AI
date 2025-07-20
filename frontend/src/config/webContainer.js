import { WebContainer } from '@webcontainer/api';

// Call only once---> create a virtual system with node js already installed to run the codes and its heavy
let webContainerInstance = null





export const getWebContainer =async()=>{
  if (webContainerInstance===null) {
    webContainerInstance = await WebContainer.boot();
  }
  return webContainerInstance;
}