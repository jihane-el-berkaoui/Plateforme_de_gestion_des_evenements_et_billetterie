package com.eventplatform.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String role;
}