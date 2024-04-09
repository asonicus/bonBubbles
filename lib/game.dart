import 'package:flutter/material.dart';
import 'package:webview_flutter_plus/webview_flutter_plus.dart';

class Game extends StatefulWidget {
  const Game({super.key});

  @override
  State<Game> createState() => _GameState();
}

class _GameState extends State<Game> {
  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false,
      child: const Scaffold(
        body: WebViewPlus(
          backgroundColor: Colors.indigo,
          initialUrl: 'assets/index.html',
          zoomEnabled: false,
          javascriptMode: JavascriptMode.unrestricted,
        ),
      ),
    );
  }
}
