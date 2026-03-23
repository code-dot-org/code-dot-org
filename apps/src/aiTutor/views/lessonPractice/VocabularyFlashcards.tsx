import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import React, {FC, useMemo, useState} from 'react';

type VocabularyItem = {id: string; word: string; definition: string};

interface VocabularyFlashcardsProps {
  vocabulary: VocabularyItem[];
}

const cardHeight = 260;

const VocabularyFlashcards: FC<VocabularyFlashcardsProps> = ({vocabulary}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showWordBank, setShowWordBank] = useState(false);

  const hasVocabulary = vocabulary.length > 0;

  const currentCard = useMemo(
    () => (hasVocabulary ? vocabulary[currentIndex] : undefined),
    [currentIndex, hasVocabulary, vocabulary]
  );

  const goTo = (nextIndex: number) => {
    setIsFlipped(false);
    setCurrentIndex(nextIndex);
  };

  const goNext = () => {
    if (!hasVocabulary) return;
    goTo((currentIndex + 1) % vocabulary.length);
  };

  const goPrev = () => {
    if (!hasVocabulary) return;
    goTo((currentIndex - 1 + vocabulary.length) % vocabulary.length);
  };

  if (!hasVocabulary) {
    return <Typography variant="body1">No vocabulary available.</Typography>;
  }

  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="h3">Vocabulary Flashcards</Typography>
      <Box sx={{width: '100%', maxWidth: 520, perspective: '1200px'}}>
        <CardActionArea onClick={() => setIsFlipped(prev => !prev)}>
          <Box
            sx={{
              position: 'relative',
              height: cardHeight,
              transition: 'transform 0.6s',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front: vocabulary word */}
            <Card
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backfaceVisibility: 'hidden',
              }}
              elevation={4}
            >
              <CardContent>
                <Typography variant="h6" component="p" align="center" color="text.secondary">
                  Word
                </Typography>
                <Typography variant="h4" align="center">
                  {currentCard?.word}
                </Typography>
              </CardContent>
            </Card>
            {/* Back: definition */}
            <Card
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
              elevation={4}
            >
              <CardContent>
                <Typography variant="h6" component="p" align="center" color="text.secondary">
                  Definition
                </Typography>
                <Typography variant="h5" align="center">
                  {currentCard?.definition}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </CardActionArea>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="outlined" onClick={goPrev}>
          Previous
        </Button>
        <Typography variant="body2">
          Card {currentIndex + 1} of {vocabulary.length}
        </Typography>
        <Button variant="outlined" onClick={goNext}>
          Next
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Tap or click the card to flip between the word and its definition.
      </Typography>

      <Box sx={{width: '100%', maxWidth: 520}}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Typography variant="subtitle1">Word Bank</Typography>
          <IconButton
            aria-label={showWordBank ? 'Hide word bank' : 'Show word bank'}
            onClick={() => setShowWordBank(prev => !prev)}
            size="small"
          >
            {showWordBank ? 'Hide' : 'Show'}
          </IconButton>
        </Stack>
        <Collapse in={showWordBank} timeout="auto" unmountOnExit>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
            {vocabulary.map(vocab => (
              <Chip key={vocab.id} label={vocab.word} />
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Stack>
  );
};

export default VocabularyFlashcards;
