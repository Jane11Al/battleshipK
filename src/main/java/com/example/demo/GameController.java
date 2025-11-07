package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Controller
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080", "http://127.0.0.1:8080"})
public class GameController {

    private int clickCount = 0;

    @GetMapping("/")
    public String home() {
        return "redirect:/game";
    }

    @GetMapping("/game")
    public String game(@RequestParam(required = false) String username, Model model) {
        model.addAttribute("username", username != null ? username : "Игрок");
        return "game";
    }

    @GetMapping("/info")
    public String gameInfo() {
        return "info";
    }

    // Простой тест сервера
    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "✅ Сервер работает! Время: " + LocalTime.now().withNano(0);
    }

    // Быстрая строка для проверки
    @GetMapping("/get-simple-string")
    @ResponseBody
    public String getSimpleString() {
        return "🚀 Простая строка от сервера! Время: " + LocalTime.now().withNano(0);
    }

    // Основной метод для получения строки с сообщением от клиента
    @PostMapping("/get-string")
    @ResponseBody
    public Map<String, Object> getStringFromServer(@RequestBody(required = false) String userMessage) {
        clickCount++;

        Map<String, Object> response = new HashMap<>();

        String baseMessage = "✅ Сервер отвечает! Текущее время: " + LocalTime.now().withNano(0) +
                ". Кнопка была нажата " + clickCount + " раз(а).";

        if (userMessage != null && !userMessage.trim().isEmpty()) {
            response.put("message", baseMessage + " Ваше сообщение: '" + userMessage + "'");
        } else {
            response.put("message", baseMessage);
        }

        response.put("clickCount", clickCount);
        response.put("timestamp", LocalTime.now().withNano(0).toString());
        response.put("status", "success");

        System.out.println("🎯 Обработан запрос №" + clickCount + ". Сообщение: " +
                (userMessage != null ? userMessage : "пусто"));

        return response;
    }

    // Получение текущего счетчика нажатий
    @GetMapping("/get-count")
    @ResponseBody
    public Map<String, Integer> getCount() {
        Map<String, Integer> response = new HashMap<>();
        response.put("count", clickCount);
        return response;
    }

    // Дополнительный метод для получения статистики
    @GetMapping("/server-status")
    @ResponseBody
    public Map<String, Object> getServerStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "online");
        status.put("serverTime", LocalTime.now().withNano(0).toString());
        status.put("totalRequests", clickCount);
        status.put("version", "1.0.0");
        status.put("message", "Сервер 'Морской бой' работает корректно");
        return status;
    }
}