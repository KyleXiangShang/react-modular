import { message } from 'antd';
import axios from 'axios';
import ExportJsonExcel from 'js-export-excel';
import { mapUrl, themeColors } from './theme';
import { includes } from 'lodash';
import XLSX from 'xlsx';


/**
 * 获取某一月份有几个周一
 * @param {*} year
 * @param {*} month
 */
let getMondays = (year, month) => {
    let d = new Date();
    d.setFullYear(year, month - 1, 1);
    let m = d.getMonth();
    let mondays = [];
    d.setDate(1);
    // Get the first Monday in the month
    while (d.getDay() !== 1) {
        d.setDate(d.getDate() + 1);
    }
    // Get all the other Mondays in the month
    while (d.getMonth() === m) {
        mondays.push(new Date(d.getTime()).format('yyyy-MM-dd 00:00:00'));
        d.setDate(d.getDate() + 7);
    }
    return mondays;
};

/**
 * 获取某一月份有几个周五
 * @param {*} years
 * @param {*} months
 */
function getFridays(years, months) {
    let fridays = [];
    let d = new Date();
    d.setFullYear(years, months - 1, 1);
    let today = new Date(d);
    let year = today.getFullYear();
    let month = today.getMonth();
    let i = 0;
    let start = new Date(year, month, 1); // 得到当月第一天
    let end = new Date(year, month + 1, 0); // 得到当月最后一天
    let start_day = start.getDay(); // 当月第一天是周几
    switch (start_day) {
        case 0:
            i = 0 - 1;
            break;
        case 1:
            i = 0 - 2;
            break;
        case 2:
            i = 0 - 3;
            break;
        case 3:
            i = 0 - 4;
            break;
        case 4:
            i = 0 - 5;
            break;
        case 5:
            i = 1;
            break;
        case 6:
            i = 0;
            break;
    }
    while (new Date(year, month, i + 6) <= end) {
        fridays.push(new Date(year, month, i).format('yyyy-MM-dd'));
        i += 7;
    }
    return fridays;
}

//数字转汉字
const SectionToChinese = (section) => {
    let chnNumChar = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    let chnUnitSection = ['', '万', '亿', '万亿', '亿亿'];
    let chnUnitChar = ['', '十', '百', '千'];
    let strIns = '',
        chnStr = '';
    let unitPos = 0;
    let zero = true;
    while (section > 0) {
        let v = section % 10;
        if (v === 0) {
            if (!zero) {
                zero = true;
                chnStr = chnNumChar[v] + chnStr;
            }
        } else {
            zero = false;
            strIns = chnNumChar[v];
            strIns += chnUnitChar[unitPos];
            chnStr = strIns + chnStr;
        }
        unitPos++;
        section = Math.floor(section / 10);
    }
    return chnStr;
};

// excel转json
let ExcelToJSON = (file) => {
    return new Promise((resolve, reject) => {
      const ext = file.name.split('.');
      if (!includes(['xls', 'xlsx'], ext[ext.length - 1])) {
        message.warning('文件格式有误！');
        reject('error');
        return;
      }
      // 支持chrome IE10
      if (!window.FileReader) {
        message.warning('浏览器版本过低，暂不支持解析Excel！');
        reject('error');
        return;
      }
  
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = function (e) {
        const source = e.target.result;
        const excelFile = XLSX.read(source, {
          type: 'binary',
        });
  
        const data = XLSX.utils.sheet_to_json(
          excelFile.Sheets[excelFile.SheetNames[0]]
        );
  
        let header = [];
        let OBJkey = Object.keys(data[0]);
        OBJkey.map((item) => {
          header.push(item);
        });
        resolve({ header, data });
      };
    });
  };

// 用于提示的message消息弹窗
let bubbleAutoClose = (msg, fn, seconds = 2) => {
    message.info(msg, seconds, fn);
    message.config({
      top: 10,
      duration: 0.1,
      maxCount: 1,
    });
  }
  
//简单Excel导出
let downloadExcel = (
    dataSource,
    columns,
    fileName,
    startTime,
    endTime,
    isFilter
) => {
    let columnsTitle = [];
    let columnsFilter = [];
    let option = {};
    if (columns.length) {
        columns.map((o) => {
            if (o.hasOwnProperty('children')) {
                // 合并单元格
                o.children.map((item, key) => {
                    columnsFilter.push(`${item.dataIndex}`);
                    columnsTitle.push(`${o.title}${item.title}`);
                });
            } else {
                let a = typeof o.title;
                let title = a == 'string' ? o.title : o.name;
                columnsFilter.push(o.dataIndex);
                columnsTitle.push(title);
            }
        });
    }
    if (dataSource.length) {
        option.fileName = fileName ? fileName : '列表';
        if (fileName && startTime && endTime) {
            option.fileName = fileName + '(' + startTime + '--' + endTime + ')';
        } else if (fileName && startTime) {
            option.fileName = fileName + '(' + startTime + ')';
        }

        dataSource = dataSource.map((item, i) => {
            for (var key in item) {
                if (isFilter !== true) {
                    item[key] = item[key] < 0 ? '--' : item[key];
                }
            }
            return item;
        });
        // bubbleAutoClose('下载中');
        option.datas = [
            {
                sheetData: dataSource,
                sheetName: 'sheet',
                sheetFilter: columnsFilter,
                sheetHeader: columnsTitle,
            },
        ];
        let toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
    } else {
        bubbleAutoClose('暂无数据');
    }
};

//复杂Excel导出
let downloadComplexExcel = (sheetData, columnsTitle, fileName) => {
    let option = {};
    if (sheetData.length) {
        option.fileName = fileName ? fileName : '列表';
        option.datas = [
            {
                sheetData: sheetData,
                sheetName: 'sheet',
                sheetHeader: columnsTitle,
            },
        ];
        let toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
    } else {
        bubbleAutoClose('暂无数据');
    }
};

let deepClone = (obj) => {
    let _obj = JSON.stringify(obj);
    let objClone = JSON.parse(_obj);
    return objClone;
};

let compare = (keys, obj1, obj2) => {
    let [key, ...nextKeys] = keys;
    let hasNextKey = nextKeys && nextKeys.length;
    return obj1[key] === obj2[key] && hasNextKey
        ? compare(nextKeys, obj1, obj2)
        : obj1[key] === obj2[key];
};
  
/**
 * 将data中keys相同的数据的prop合并 - 未用
 * @param {Array} keys
 * @param {String} prop
 * @param {Array} data
 */
let translate = (keys, prop, data) => {
    return data.reduce((accumulator, currentValue) => {
        let exist = accumulator.find((item) => {
            return compare(keys, item, currentValue);
        });
        if (exist) {
            exist[prop] = `${exist[prop]},${currentValue[prop]}`;
        } else {
            accumulator.push(currentValue);
        }
        return accumulator;
    }, []);
};

/**
 * 切换页面主题颜色时 变换echarts 颜色
 * @param {*} args 
 * @returns 
 */
const changeThemeListener = (args) => {
    const array = Array.isArray(args) ? args : [args];
    const fn = function (e) {
        const theme = e.data.theme;
        if (theme) {
            array.forEach((item) => {
                const { type, instance, fn } = item;
                if (type === 'map') {
                    const url = mapUrl[theme];
                    instance.getSource().setUrl(url);
                } else if (type === 'echarts') {
                    const color = themeColors[theme];
                    changeEchartsColor(instance, color, item.chartsType);
                } else if (type === 'custom') {
                    //自定义 回调
                    fn();
                }
            });
        }
    };
    window.addEventListener('message', fn, false);
    return () => {
        window.removeEventListener('message', fn);
    };
};

const changeEchartsColor = (echartsInstance, fontColor, chartsType) => {
    let option = {
        ...echartsInstance.getOption(),
    };
    window.echartsInstance = echartsInstance;
    let {
        xAxis,
        yAxis,
        title,
        legend,
        calendar,
        angleAxis,
        radiusAxis,
        visualMap,
    } = option;

    if (xAxis || yAxis) {
        xAxis = xAxis.map((item) => {
            item.axisLine.lineStyle.color = fontColor;
            item.axisLabel.color = fontColor;
            return item;
        });

        yAxis = yAxis.map((item) => {
            item.axisLine.lineStyle.color = fontColor;
            item.axisLabel.color = fontColor;
            item.nameTextStyle.color = fontColor;
            if (chartsType == 'yAxis-splitLine') {
                item.splitLine.lineStyle.color = fontColor;
            }
            return item;
        });

        option = {
            ...option,
            xAxis,
            yAxis,
        };
    }

    if (angleAxis || radiusAxis) {
        angleAxis = angleAxis.map((item) => {
            item.data.map((d) => {
                if (!d.textStyle) return;
                d.textStyle.color = fontColor;
            });
            return item;
        });

        radiusAxis = radiusAxis.map((item) => {
            item.axisLine.lineStyle.color = fontColor;
            return item;
        });

        option = {
            ...option,
            angleAxis,
            radiusAxis,
        };
    }

    if (legend) {
        legend = legend.map((item) => {
            item.textStyle.color = fontColor;
            if (item.pageTextStyle) {
                item.pageTextStyle.color = fontColor;
            }
            return item;
        });

        option = {
            ...option,
            legend,
        };
    }

    if (title && title.length) {
        title = title.map((item) => {
            item.textStyle.color = fontColor;
            item.subtextStyle.color = fontColor;
            return item;
        });
        option = {
            ...option,
            title,
        };
    }

    if (calendar && calendar.length) {
        calendar = calendar.map((item) => {
            item.dayLabel.color = fontColor;
            item.monthLabel.color = fontColor;
            return item;
        });
        option = {
            ...option,
            calendar,
        };
    }

    if (visualMap && visualMap.length) {
        visualMap = visualMap.map((item) => {
            item.textStyle.color = fontColor;
            return item;
        });
        option = {
            ...option,
            visualMap,
        };
    }

    echartsInstance.setOption(option, true);
};


/**
* 求最大值、最小值、平均值
* @param {Array} array 传入一个数组，包含一堆的数字
* @returns {Array} 返回 [平均值，最大值，最小值]
*/
const getAverageMaxMinNum = (array) => {
    if (!!array && array.length !== 0) {
        const average = array.reduce((tmp, item, index) => {
            if (index !== array.length - 1) return tmp + item;
            return (tmp + item) / array.length;
        });
        const max = Math.max(...array);
        const min = Math.min(...array);
        return [average, max, min];
    }
};

/**
 * 测试图片路径是否有效
 * @param {str} url 图片路径
 */
const testImgUrl = (url) => {
    let imgReg = /\.(png|jpe?g|gif|webp)(\?.*)?$/;
    return new Promise(function (resolve, reject) {
        if (imgReg.test(url)) {
            let imgObj = new Image();
            imgObj.src = url;
            imgObj.onload = function (res) {
                resolve(res);
            };
            imgObj.onerror = function (err) {
                reject('该路径未找到图片');
            };
        } else {
            reject('该路径不是图片路径');
        }
    });
};

/**
 * 防抖函数
 * @param {回调函数} callback 回调函数
 * @param {Number} delay  时长
 */
const debounce = (callback, delay) => {
    let timer;
    return (...params) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            callback(...params);
        }, delay);
    };
};

export {
    getMondays,
    getFridays,
    SectionToChinese,
    ExcelToJSON,
    downloadExcel,
    downloadComplexExcel,
    deepClone,
    translate,
    changeThemeListener,
    getAverageMaxMinNum,
    testImgUrl,
    debounce
}