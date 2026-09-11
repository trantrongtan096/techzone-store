package com.techzone.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "showrooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Showroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(length = 50)
    private String phone;

    @Column(name = "map_url", length = 1000)
    private String mapUrl;

    @Column(name = "priority_index")
    private Integer priorityIndex;

    @Column(name = "is_active")
    private Boolean isActive;
}
