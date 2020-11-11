class AdvocacySite
  def self.get_blocks(request)
    [
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
              text_actual: "Letter to teacher or principal",
              url: CDO.code_org_url("/promote/letter")
            },
            {
              text_actual: "Letter to local elected official",
              url: "https://www.votervoice.net/Code/campaigns/58463/respond",
              new_tab: true
            },
            {
              text_actual: "Presentation to advocate for CS",
              url: CDO.code_org_url("/files/computer_science_advocacy.pptx"),
              new_tab: true
            },
            {
              text_actual: "Host an Hour of Code",
              url: "https://hourofcode.com/how-to/public-officials"
            }
          ]
      },

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
              text_actual: "1-page summary",
              url: "https://docs.google.com/document/d/15zBdBbXUA-yEzxEq0VeWAEb9nXuGjmNFWNrYp6UdM8U/edit?usp=sharing",
              new_tab: true
            },
            {
              text_actual: "National landscape state details",
              url: "https://code.org/advocacy/landscape.pdf",
              new_tab: true
            },
            {
              text_actual: "Current state and federal legislation",
              url: "/current-legislation"
            },
            {
              text_actual: "Nation's leaders support CS",
              url: CDO.code_org_url("/files/open_letter_for_cs.pdf"),
              new_tab: true
            }
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
              url: CDO.code_org_url("/files/Making_CS_Fundamental.pdf"),
              new_tab: true
            },
            {
              text_actual: "Funding models document",
              url: "https://docs.google.com/document/d/1yU2YS5YWHEZBN363pUUIy-FBqDDQVoOSFOsSb06qMbM/edit",
              new_tab: true
            },
            {
              text_actual: "Creating teacher pathways",
              url: CDO.code_org_url("/files/TeacherPathwayRecommendations.pdf"),
              new_tab: true
            },
            {
              text_actual: "More policy resources",
              url: "/policy-resources"
            },

          ]
      },

      {
        type: "block",
        title_actual: "MORE RESOURCES",
        text: "",
        color1: "185, 191, 21",
        color2: "209, 213, 103",
        image: "/images/advocacy2.jpg",
        links:
          [
            {
              text_actual: "AP CS report",
              url: CDO.code_org_url("/promote/ap")
            },
            {
              text_actual: "State planning toolkit",
              url: "https://docs.google.com/document/d/13N843-BjK9JHXNWKFzJlxhpw7f6Y2pJF6tpV2aHM1HU/edit",
              new_tab: true
            },
            {
              text_actual: "Bring CS to your school or district",
              url: CDO.code_org_url("/yourschool")
            },
            {
              text_actual: "Even more resources",
              url: CDO.code_org_url("/promote/morestats")
            }
          ]
      }
    ]
  end
end
