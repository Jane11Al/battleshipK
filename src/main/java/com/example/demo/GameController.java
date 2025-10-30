package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class GameController {

    @GetMapping("/game")
    public String game(@RequestParam(required = false) String username, Model model) {
        model.addAttribute("username", username != null ? username : "Игрок");
        return "game";
    }

    @GetMapping("/info")
    public String gameInfo() {
        return "info";
    }
}