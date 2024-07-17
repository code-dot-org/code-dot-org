class AdvocacySite
  def self.get_blocks(request)
    [
      {
        type: "block",
        title_actual: "NATIONWIDE MOMENTUM FOR CS",
        text: "",
        color1: "0, 148, 202",
        color2: "89, 185, 220",
        image: "/images/advocacy4.jpg",
        links:
          [
            {
              text_actual: "State of CS Report",
              url: "/stateofcs",
            },
            {
              text_actual: "State-by-state details",
              url: "http://bit.ly/9policies",
              new_tab: true
            },
            {
              text_actual: "Nation's leaders support CS",
              url: "https://www.ceosforcs.com/",
              new_tab: true
            }
          ]
      },
      {
        type: "block",
        title_actual: "TAKE ACTION",
        text: "",
        color1: "118, 101, 160",
        color2: "166, 155, 193",
        image: "/images/advocacy3.jpg",
        links:
          [
            {
              text_actual: "Bring CS to your school or district",
              url: CDO.code_org_url("/yourschool"),
              new_tab: true
            },
          ]
      },
      {
        type: "block",
        title_actual: "POLICY RECOMMENDATIONS",
        text: "",
        color1: "0, 173, 188",
        color2: "89, 202, 211",
        image: "/images/advocacy1.jpg",
        links:
          [
            {
              text_actual: "Our state policy agenda",
              url: "/making_cs_foundational_2024.pdf",
              new_tab: true
            },
            {
              text_actual: "Policy resources and data",
              url: "/policy-resources",
            },
          ]
      },
    ]
  end
end
