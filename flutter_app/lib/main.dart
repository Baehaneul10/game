// 네온 팝 디펜스 웹뷰 앱
// - 뒤로가기: 웹뷰 히스토리 우선, 최상위에서는 "한 번 더 누르면 종료" (실수 종료 방지)
// - 전체화면 몰입 모드, 상태바 다크
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

const gameUrl = 'https://baehaneul10.github.io/game/'; // Vercel 도메인으로 교체 가능

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  runApp(const NpdApp());
}

class NpdApp extends StatelessWidget {
  const NpdApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '네온 팝 디펜스',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(scaffoldBackgroundColor: const Color(0xFF0B0E17)),
      home: const GamePage(),
    );
  }
}

class GamePage extends StatefulWidget {
  const GamePage({super.key});
  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  late final WebViewController _c;
  DateTime? _lastBack;

  @override
  void initState() {
    super.initState();
    _c = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0B0E17))
      ..loadRequest(Uri.parse(gameUrl));
  }

  Future<bool> _onBack() async {
    if (await _c.canGoBack()) {
      _c.goBack();
      return false;
    }
    final now = DateTime.now();
    if (_lastBack == null || now.difference(_lastBack!) > const Duration(seconds: 2)) {
      _lastBack = now;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('한 번 더 누르면 종료됩니다'),
        duration: Duration(seconds: 2),
      ));
      return false;
    }
    return true; // 2초 내 두 번 → 종료
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        if (await _onBack() && mounted) {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0B0E17),
        body: SafeArea(child: WebViewWidget(controller: _c)),
      ),
    );
  }
}
