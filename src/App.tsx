// i18n
import 'src/locales/i18n';

// scrollbar
import 'simplebar-react/dist/simplebar.min.css';

// lightbox
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

// map
import 'mapbox-gl/dist/mapbox-gl.css';

// editor
import 'react-quill/dist/quill.snow.css';

// carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// image
import 'react-lazy-load-image-component/src/effects/blur.css';

// ----------------------------------------------------------------------

// routes
import Router from 'src/routes/sections';
// theme
import ThemeProvider from 'src/theme';
// locales
import { LocalizationProvider } from 'src/locales';
// hooks
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
// components
import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsProvider, SettingsDrawer } from 'src/components/settings';
// sections
import { CheckoutProvider } from 'src/sections/checkout/context';
// auth
import { AuthProvider, AuthConsumer } from 'src/auth/context/jwt';
// import { AuthProvider, AuthConsumer } from 'src/auth/context/auth0';
// import { AuthProvider, AuthConsumer } from 'src/auth/context/amplify';
// import { AuthProvider, AuthConsumer } from 'src/auth/context/firebase';

// ----------------------------------------------------------------------

export default function App() {
  const thocode = `

 ______  __ __   ___      __   ___   ___      ___  __ __   ___      __ ______  ____    ___  ____    ____  ____   __ __   ____  ______       __   ___   ___ ___
|      T|  T  T /   \\    /  ] /   \\ |   \\    /  _]|  T  T /   \\    /  ]      Tl    j  /  _]|    \\  /    T|    \\ |  T  T /    T|      T     /  ] /   \\ |   T   T
|      ||  l  |Y     Y  /  / Y     Y|    \\  /  [_ |  l  |Y     Y  /  /|      | |  T  /  [_ |  _  YY   __j|  _  Y|  l  |Y  o  ||      |    /  / Y     Y| _   _ |
l_j  l_j|  _  ||  O  | /  /  |  O  ||  D  YY    _]|  _  ||  O  | /  / l_j  l_j |  | Y    _]|  |  ||  T  ||  |  ||  _  ||     |l_j  l_j   /  /  |  O  ||  \\_/  |
  |  |  |  |  ||     |/   \\_ |     ||     ||   [_ |  |  ||     |/   \\_  |  |   |  | |   [_ |  |  ||  l_ ||  |  ||  |  ||  _  |  |  | __ /   \\_ |     ||   |   |
  |  |  |  |  |l     !\\     |l     !|     ||     T|  |  |l     !\\     | |  |   j  l |     T|  |  ||     ||  |  ||  |  ||  |  |  |  ||  T\\     |l     !|   |   |
  l__j  l__j__j \\___/  \\____j \\___/ l_____jl_____jl__j__j \\___/  \\____j l__j  |____jl_____jl__j__jl___,_jl__j__jl__j__jl__j__j  l__jl__j \\____j \\___/ l___j___j
  `;

  console.info(`%c${thocode}`, 'color: #5BE49B');

  useScrollToTop();

  return (
    <AuthProvider>
      <LocalizationProvider>
        <SettingsProvider
          defaultSettings={{
            themeMode: 'light', // 'light' | 'dark'
            themeDirection: 'ltr', //  'rtl' | 'ltr'
            themeContrast: 'default', // 'default' | 'bold'
            themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
            themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
            themeStretch: false,
          }}
        >
          <ThemeProvider>
            <MotionLazy>
              <SnackbarProvider>
                <CheckoutProvider>
                  <SettingsDrawer />
                  <ProgressBar />
                  <AuthConsumer>
                    <Router />
                  </AuthConsumer>
                </CheckoutProvider>
              </SnackbarProvider>
            </MotionLazy>
          </ThemeProvider>
        </SettingsProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
}
