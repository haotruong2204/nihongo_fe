import merge from 'lodash/merge';
import {
  enUS as enUSAdapter,
  ja as jaJPAdapter,
  vi as viVNAdapter,
  zhCN as zhCNAdapter,
} from 'date-fns/locale';
// core
import {
  enUS as enUSCore,
  jaJP as jaJPCore,
  viVN as viVNCore,
  zhCN as zhCNCore,
} from '@mui/material/locale';
// date-pickers
import {
  enUS as enUSDate,
  jaJP as jaJPDate,
  viVN as viVNDate,
  zhCN as zhCNDate,
} from '@mui/x-date-pickers/locales';
// data-grid
import {
  enUS as enUSDataGrid,
  jaJP as jaJPDataGrid,
  viVN as viVNDataGrid,
  zhCN as zhCNDataGrid,
} from '@mui/x-data-grid';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'Vietnamese',
    value: 'vi',
    systemValue: merge(viVNDate, viVNDataGrid, viVNCore),
    adapterLocale: viVNAdapter,
    icon: 'flagpack:vn',
  },
  {
    label: 'English',
    value: 'en',
    systemValue: merge(enUSDate, enUSDataGrid, enUSCore),
    adapterLocale: enUSAdapter,
    icon: 'flagpack:gb-nir',
  },
  {
    label: 'Japanese',
    value: 'ja',
    systemValue: merge(jaJPDate, jaJPDataGrid, jaJPCore),
    adapterLocale: jaJPAdapter,
    icon: 'flagpack:jp',
  },
  {
    label: 'Chinese',
    value: 'cn',
    systemValue: merge(zhCNDate, zhCNDataGrid, zhCNCore),
    adapterLocale: zhCNAdapter,
    icon: 'flagpack:cn',
  },
];

export const defaultLang = allLangs[0];
