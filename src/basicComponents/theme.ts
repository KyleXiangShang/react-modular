interface IMapUrl {
  dark: string,
  light: string
};


export const mapUrl: IMapUrl = {
    dark: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
    light:
      ' https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}', //高德
    // light: 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i380072576!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0'//谷歌
  };
  
  export const themeColors: IMapUrl = {
    dark: 'rgba(255, 255, 255, 1)',
    light: 'rgba(0,0,0,1)',
  };
  